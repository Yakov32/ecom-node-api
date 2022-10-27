'use strict';

function Err(message){
   
   this.success = false;
   this.message = message;
}

module.exports = Err;