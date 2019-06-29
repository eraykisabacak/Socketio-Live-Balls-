app.controller('indexController',['$scope','indexFactory',($scope,indexFactory) =>{

    $scope.messages = [];
    $scope.players = {};
    $scope.init = () => {
        const username = prompt('Please enter username');

        if(username)
            initSocket(username);
        else
            return false;
    };
    
    function scrollTop() {
        setTimeout(() => {
            const element = document.getElementById('chat-area');
            element.scrollTop = element.scrollHeight;
        });
    }
    
    function showBubble(id, message) {
        $('#' + id).find('.message').show().html(message);

        setTimeout(() => {
            $('#' + id).find('.message').hide();
        }, 2000);
    }

    async function initSocket(username){
        const connectionOptions = {
            reconnectionAttempts:3,
            reconnectionDelay:1000
        };

        try{


        const socket = await indexFactory.connectSocket("http://localhost:3000",connectionOptions);
                socket.on('initPlayers',(players) => {
                    $scope.players = players;
                    $scope.$apply();
                });

                socket.emit('newUser',{username});
                socket.on('newUser',(data) => {
                    const messageData = {
                        type: {
                            code:0, // server or user message
                            message: 1 // login or disconnect message
                        },// info
                        username: data.username,
                    };
                    $scope.messages.push(messageData);
                    $scope.players[data.id] = data;
                    scrollTop();
                    $scope.$apply();
                });

                socket.on('disUser', (data) => {
                    const messageData = {
                        type: {
                            code:0, // server or user message
                            message: 0
                        },// info
                        username: data.username
                    };
                    $scope.messages.push(messageData);
                    delete $scope.players[data.id];
                    scrollTop();
                    $scope.$apply();
                });

                socket.on('animate',(data) => {
                    console.log(data);
                    $('#' + data.socketId).animate({ 'left' : data.x, 'top' : data.y});

                });

                socket.on('newMessage',(message) => {
                    $scope.messages.push(message);
                    $scope.$apply();
                    showBubble(message.socketId,message.text);
                    scrollTop();
                });

                $scope.onClickPlayer = ($event) => {
                    let x = $event.offsetX;
                    let y = $event.offsetY;

                    socket.emit('animate',{x,y});

                    $('#' + socket.id).animate({ 'left' : x, 'top' : y});

                };

                $scope.newMessage = () => {
                    let message = $scope.message;
                    const messageData = {
                        type: {
                            code:1, // server or user message
                        },
                        username: username,
                        text: message
                    };
                    $scope.messages.push(messageData);
                    $scope.message = '';

                    socket.emit('newMessage',messageData);
                    showBubble(socket.id,message);
                    scrollTop();
                };

        }
        catch(e){
            console.log(e);
        }
    }
}]);