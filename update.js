#!/usr/bin/node

//Revisar: https://github.com/zma/usefulscripts/blob/master/script/post-receive

var sys = require('util');
var net = require('net');
var exec = require('child_process').exec;

var debug = true;
debug = debug? console : { log: function(){} };

//Mensaje base:
var basemsg = 'g:$GRUPO m:"$MSG"';
var port = 40011; //Poner puerto de Naidbot
var ip_naidbot = '192.168.0.45'; //Poner IP de NaidBot

// print process.argv
process.argv.forEach(function (val, index, array) { debug.log(index + ': ' + val); });

//Comando para sacar todos los commits pusheados en este UPDATE.
var cmd = 'git log --pretty=format:"%h - %an, %ar : %s" '+ process.argv[2]+' ' + process.argv[3]  + '..' + process.argv[4];
if(process.argv[3] == 0 ) {
  cmd = 'git log --pretty=format:"%H - %an, %ar : %s"  --all  --not $(git branch -a | grep -Fv ' + process.argv[2].replace("refs/heads/","") + ' )';
  //cmd = 'git log ' + process.argv[2] + ' ';
  //cmd = 'git rev-list ' + process.argv[4];
  cmd = 'git log --pretty=format:"%H %d - %an, %ar : %s" ' + process.argv[4] +'~1..' + process.argv[4];
  cmd = 'git rev-list ' + process.argv[5]  + '..' + process.argv[4];


}
debug.log(cmd);
//Ejecuto el comando que me tiene que dar el resultado a poner en el mensaje del grupo
var child = exec(cmd, function (error, stdout, stderr) {
  debug.log('@stdout: ' + stdout);
  debug.log('@stderr: ' + stderr);
  if (error !== null) {
    console.log('@exec error: ' + error);
  }
  else {
    
    //Consigo el nombre del repositorio
    var repo = process.cwd().split('/');
    repo = repo[repo.length-1].replace(".git","");

    var branch = process.argv[2].replace("refs/heads/","");
    var branchgroup = branch.split('/')[0];

    //Consigo la rama updateada:
    //Aquí hago el tema de todos los grupos a los que tengo que informar
    //Inicialmente crearé cuatro grupos
    //USERZOOM: Siempre estará activo y recibirá todos los mensajes de commit
    //USERZOOM/repository.git: Solo se enviará cuando se updatea ese repositorio en concreto
    //USERZOOM/repository.git/rama: Solo se enviará cuando se updatea esa rama de ese repositorio en concreto, la rama es completa ej: USERZOOM/repository.git/fix/ranking-question
    //USERZOOM/rama: Se enviará cuando se update esa rama para cualquier repositorio.
    var groups = ['USERZOOM','USERZOOM/'+repo,'USERZOOM/'+repo+'/'+branch,'USERZOOM/'+branchgroup];
    //Envio los mensaje
    //Creo los sockets
    var socket = net.createConnection(port,ip_naidbot,function () {
  
    });

   socket.on('data',function(data) {
      debug.log('RESPONSE: ' + data);
    }).on('connect',function(){
      var entorno = 'PUSH: ' + repo + ' [' + branch + ']\r\n';
  //Envio los mensajes para todos los grupos
   for (var i = 0;i < groups.length;i++) {
    var msg = basemsg.replace('$GRUPO', groups[i]).replace("$MSG",entorno + stdout);
    socket.write(msg);
   }
      socket.end();
    }).on('end',function() {
      debug.log('DONE');
    }).on('error',function(e) {
      console.log('['+ e + '] Servidor Naibot apagado...'); 
    });

  }
});
