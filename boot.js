var spawn = require('child_process').spawn;
spawn('python', ['mail.py'], {'stdio': 'inherit'});
spawn('python', ['serve.py'], {'stdio': 'inherit'});
