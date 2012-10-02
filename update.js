#!/usr/bin/node

//Node script to send announcements from VREF gitolite server to Naidbot @aelinformatico

//TODO: Review: https://github.com/zma/usefulscripts/blob/master/script/post-receive

({ 
  //Debug send us verbose output on push event.
  debug: (true)? console : { log: function(){} },
  
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
        // USERZOOM: Get announces from all repositories
        // USERZOOM/repository.git: Get announces from this specific repository
        // USERZOOM/repository.git/rama: Get announces from specific repository and branch 
        // USERZOOM/rama: Get announces from all repositories with this specific branch
        // var groups = ['USERZOOM','USERZOOM/'+repo,'USERZOOM/'+repo+'/'+branch,'USERZOOM/'+branchgroup];
    
        // Initially for testing pouposses only use group USERZOOM
        var groups = ['USERZOOM'];
    
        //Send message to Socket Naidbot.
        var socket = l_this.net.createConnection(l_this.naidbot.port,l_this.naidbot.ip,function () { });
        socket.on('data',function(data) {
            l_this.debug.log('RESPONSE: ' + data);
          }).on('connect',function(){
            // Header message
            var entorno = 'PUSH: ' + repo + ' [' + branch + ']' + (l_this.newbranch?' (new branch)':'') + '\r\n';
            // Send the message to all groups
            for (var i = 0;i < groups.length;i++) {
              var msg = l_this.naidbot.basemsg.replace('$GRUPO', groups[i]).replace("$MSG",entorno + stdout);
              socket.write(msg);
            }
            socket.end();
          }).on('end',function() {
              l_this.debug.log('Socket closed');
            }).on('error',function(e) {
              console.log('['+ e + '] Naidbot server not running, please contact "Oficina de Madrid"...');
            });
      }
    });
  }
}).init();
