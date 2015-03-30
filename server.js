var net = require('net');
var fs = require('fs');
var colors = require('colors');

var server = net.createServer();

var todos = JSON.parse( fs.readFileSync('./data.json') );

server.on('connection', function(client) { 
  console.log('client connected');
  client.write( colors.rainbow("Welcome to our ToDo Application!") );
  client.write("\n");

  client.setEncoding('utf8');

  client.on('data', function(stringFromClient) {
    
    var clientRequestArray = stringFromClient.split(" ")

    switch ( clientRequestArray[0].trim() ) {
      case 'add':
        var taskToAdd = clientRequestArray[1].trim();

        if (!taskToAdd) {
          client.write("'add' requires a second paramter.\n Type 'help' for usage instructions.\n ");
          client.end();
        }

        todos.push({
          task: taskToAdd,
          completed: false
        });

        fs.writeFile('./data.json', JSON.stringify(todos), function(err){
          if (err) { console.log(err) }
        });

        client.write( colors.green("Task added!\n") );
        client.end();
        break;

      case 'completed':
        var completedTask = clientRequestArray[1].trim();

        if (!completedTask) {
          client.write("'completed' requires a second paramter.\n Type 'help' for usage instructions.\n ");
          client.end();
        }

        todos.forEach(function(todo){
          if (todo.task === completedTask) {
            todo.completed = true;
          }
        });

        fs.writeFile('./data.json', JSON.stringify(todos), function(err){
          if (err) { console.log(err) }
        });

        client.write( colors.green("Task status updated\n") );
        client.end();
        break;

      case 'list':
        client.write( colors.cyan.bold.underline("All ToDo Items:\n") );
        todos.forEach(function(todo){
          if (todo.completed === false) {
            client.write( colors.green( todo.task + ": incomplete \n") );
          } else {
            client.write( colors.strikethrough.red( todo.task + ": complete \n")  );
          }
        })
        client.end();
        break;

      case 'help':
        client.write( colors.red.bold.underline("Usage Commands:\n") );
        client.write( colors.green("add [ToDo] - add a new ToDo\n") );
        client.write( colors.green("completed [ToDo] - mark a ToDo as complete\n") );
        client.write( colors.green("list - see all ToDo items\n") );

        client.end();
        break;

      default:
        console.log( colors.rainbow("Unknown action attempted by client") ); 

        client.write( colors.red("Action not supported\n") );
        client.write( colors.red("Type 'help' to see all supported commands\n") );
        client.end();
    }

  });
});

server.listen(8124, function() { 
  console.log( colors.rainbow('Listening on port 8124') );
});