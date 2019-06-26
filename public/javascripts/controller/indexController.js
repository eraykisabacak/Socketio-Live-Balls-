app.controller('indexController',['$scope','indexFactory',($scope,indexFactory) =>{

    const connectionOptions = {
        reconnectionAttempts:3,
            reconnectionDelay:1000
    };
    indexFactory.connectSocket("http://localhost:3000",connectionOptions)
    .then((socket) => {
        console.log('bağlantı başarılı',socket);
    }).catch((err) => {
        console.log(err);
    });
}]);