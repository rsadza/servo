// Include the cluster module
var cluster = require('cluster');
var control = require('strong-cluster-control');


control.start({
  size: control.CPUS,
  shutdownTimeout: 5000,
  terminateTimeout: 5000,
  throttleDelay: 5000
}).on('error', function(er) {
  // don’t need to manually restart the workers
  console.warn('Worker Crashed!', er);
});

// Code to run if we're in the master process
if (!cluster.isMaster) {
    // Code to run if we're in a worker process
    require('./app');
}