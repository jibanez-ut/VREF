#!/usr/bin/node

//Node script to send announcements from VREF gitolite server to Naidbot @aelinformatico

//TODO: Review: https://github.com/zma/usefulscripts/blob/master/script/post-receive

({ 
  //Debug send us verbose output on push event.
  debug: (false)? console : { log: function(){} },
  
  //Requires
  sys:  require('util'),
  net:  require('net'),
  exec: require('child_process').exec,


  //Boolean variable, Push created or not a new branch.
  newbranch: (process.argv[3] == 0),

  //NaidBot configuration
  
  naidbot: {
    basemsg: 'g:$GRUPO m:"$MSG"\n', //Base message to naidbot
    port: 30000, //NaidBot socket port
    ip: 'localhost', //NaidBot socket IP
  },
  init: function() {
    var l_this = this;
    var cmd = "";
    // print process.argv arguments in case of debug activated
    if(l_this.debug) { process.argv.forEach(function (val, index, array) { l_this.debug.log(index + ': ' + val); }); }
    
    // Git command creation
    if(l_this.newbranch ) { // Git show only last commit information in case of new branch created.
      cmd = 'git show --pretty=format:"%h - %an, %ar : %s" ' + process.argv[4] + ' | head -n 1';
    }
    else { // Git show all comits pushed log.
      cmd = 'git log --pretty=format:"%h - %an, %ar : %s" '+ process.argv[2]+' ' + process.argv[3]  + '..' + process.argv[4];
    }
    l_this.debug.log(cmd);
  
    //Send command to system.
    var child = l_this.exec(cmd, function (error, stdout, stderr) {
      l_this.debug.log('@stdout: ' + stdout);
      l_this.debug.log('@stderr: ' + stderr);
      if (error !== null) {
        console.log('@exec error: ' + error);
      }
      else {
        //Get repository name
        var repo = process.cwd().split('/');
        repo = repo[repo.length-1].replace(".git","");

        //Get branch name
        var branch = process.argv[2].replace("refs/heads/","");
    
        //Get first diretory of branch.
        var branchgroup = branch.split('/')[0];

        // Here are all groups to sned infio
        // Four initial groups
        // uz: Get announces from all repositories
        // uz/repository.git: Get announces from this specific repository
        // uz/repository.git/rama: Get announces from specific repository and branch 
        // uz/rama: Get announces from all repositories with this specific branch
        // var groups = ['uz','uz/'+repo,'uz/'+repo+'/'+branch,'uz/'+branchgroup];
    
        // Two groups uz and (uz/it or uz/qa) depend of the repo name
        var group_uz = 'it';
        switch(repo) {
          case 'selenium':
          case 'qascripts':
          case 'kayako':
          case 'support':
            group_uz = 'qa';
            break;
        }
        // Initially for testing pouposses only use group USERZOOM
        var groups = ['uz',group_uz];
        // Send the message to all groups
        for (var i = 0;i < groups.length;i++) {
          // Send message to Socket Naidbot.
          try {
            var socket = l_this.net.Socket();
            socket.connect(l_this.naidbot.port,l_this.naidbot.ip,function () { });
            var entorno = '[$NAIDBOTGROUP] PUSH: ' + repo +' [' + branch + ']' + (l_this.newbranch?' (new branch)':'') + '\r\n';
            var msg = l_this.naidbot.basemsg.replace('$GRUPO', groups[i]).replace("$MSG",entorno + stdout).replace('$NAIDBOTGROUP',groups[i]);
            socket.write(msg);
            socket.end();
          }
          catch(e) { console.log('['+ e + '] Naidbot server not running, please contact "Oficina de Madrid"...'); }      
        }
      }
    });
  }
}).init();
