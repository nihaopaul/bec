process.on('message', function(m) {
  console.log('CHILD got message:', m);
});

process.send({ foo: 'bar' });
	



setTimeout(function() { process.exit(); }, 10000);

