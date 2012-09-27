#!/usr/bin/node

var debug = true;

debug = debug? console : { log: function(){} };

// print process.argv
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

// http://nodejs.org/api.html#_child_processes
var sys = require('util')
var exec = require('child_process').exec;
var child;

//Comando para sacar todos los commits pusheados en este UPDATE.
var cmd = 'git log --pretty=format:"%h - %an, %ar : %s" '+ process.argv[2]+' ' + process.argv[3]  + '..' + process.argv[4];

//Ejecuto el comando que me tiene que dar el resultado a poner en el mensaje del grupo
child = exec(cmd, function (error, stdout, stderr) {
  console.log('@stdout: ' + stdout);
  console.log('@stderr: ' + stderr);
  if (error !== null) {
    console.log('@exec error: ' + error);
  }
  else {
    //Aquí hago el tema de todos los grupos a los que tengo que informar
    //Inicialmente crearé cuatro grupos
    //USERZOOM: Siempre estará activo y recibirá todos los mensajes de commit
    //USERZOOM/repository.git: Solo se enviará cuando se updatea ese repositorio en concreto
    //USERZOOM/repository.git/rama: Solo se enviará cuando se updatea esa rama de ese repositorio en concreto, la rama es completa ej: USERZOOM/repository.git/fix/ranking-question
    //USERZOOM/rama: Se enviará cuando se update esa rama para cualquier repositorio.
    
    //Consigo el nombre del repositorio
    var repo = process.cwd().split('/');
    repo = repo[repo.length-1];

    //Consigo la rama updateada:
    var branch = process.argv[2].replace("refs/heads/","");
    console.log(branch);
   //Aquí hago el tema del socket
  }
});
