angular.module('starter.controllers', ['ionic', 'ngCordova'])

.controller('AppCtrl', function($scope, $cordovaFileTransfer, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('GaleriasCtrl', function($scope, $rootScope, $state, $stateParams) {
  $scope.galerias = [
    { title: 'Tortas', id: 14 },
    { title: 'Bombons', id: 15 },
    { title: 'Salgados', id: 16 }
  ];

  $scope.abrirGaleria = function(id, title){

    $rootScope.tituloGaleria = title;
    $state.go("app.galeria", {
        "galeriaId": id
    });
  }
})

.controller('GaleriaCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaFileTransfer, $ionicModal, $ionicLoading, $ionicPlatform, $cordovaFile, $ionicPopup, $cordovaProgress, $timeout, GaleriaService) {

    $scope.$on('$ionicView.enter', function() {
       $scope.editButton = false;
       $scope.doneEditButton = false;
       $scope.cancelEditButton = false;
       $scope.tabSource = true;
       $scope.pictureSelected = false;
       $scope.listButton = true;
       $scope.containerPic = false;
       $scope.containerShow = true;
    })

    // Sender modal
    // Form data for the login modal
    $scope.picture = {};
    $scope.imageName = 'image.png';

    $ionicModal.fromTemplateUrl('templates/galeria/send.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalSend = modal
    })

    // Triggered in the sender modal to close it
    $scope.closeSend = function() {
        $scope.modalSend.hide();
    };

    // Open the Picture sender modal
    $scope.openSend = function() {
        $scope.modalSend.show();
    };

    // Perform the send picture action when the user submits the form
    $scope.doSend = function() {


        var options = {
          fileKey: "Filedata",
          fileName: $scope.imageName,
          chunkedMode: false,
          mimeType: "image/png"
        };

        var img = document.getElementById('camPic');

        var imgUrl = img.src;

        var params = {};
        params.galeriaID = $stateParams.galeriaId;
        params.dsArquivoGaleria = $scope.picture.name;
        options.params = params;

        //options.httpMethod = 'POST';
        options.trustAllHosts = true;

        $ionicLoading.show({
          template: '<p>Enviando...</p><ion-spinner></ion-spinner>'
        });

        $cordovaFileTransfer.upload($rootScope.apiURL + $rootScope.apiContext + "/admin/ws/galeria/upload", GaleriaService.getImageURI(), options).then(function(result) {
              console.log("SUCCESS: " + JSON.stringify(result));

              $scope.closeSend();
              $scope.cameraPic = 'data:image/png;base64,';

              $ionicLoading.hide();

              var alertPopup = $ionicPopup.alert({
                 title: 'Sucesso',
                 template: 'Imagem enviada com sucesso!'
              });

          }, function(err) {
              console.log("ERROR: " + JSON.stringify(err));

              $ionicLoading.hide();

              var alertPopup = $ionicPopup.alert({
                 title: 'Erro',
                 template: 'Erro ao enviar a imagem, por favor tente novamente!'
              });

          }, function (progress) {

          });

        $scope.editButton = false;
        $scope.listButton = true;
        $scope.containerShow = true;
        $scope.picture.name = ''; // Clear input name field

    };

    $scope.takePicture = function(source){

        if ( source == 'camera' ){
            var sourceType = navigator.camera.PictureSourceType.CAMERA;
        }else{
            var sourceType = navigator.camera.PictureSourceType.PHOTOLIBRARY;
        }

        var cameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            mediaType: Camera.MediaType.PICTURE,
            sourceType: sourceType,
            allowEdit: false,
            correctOrientation: true,
            targetWidth: 1000,
            targetHeight: 800
        };
        var success = function(data){
          $scope.$apply(function () {
              /*
               remember to set the image ng-src in $apply,
               i tried to set it from outside and it doesn't work.
               */
              $scope.cameraPic = "data:image/png;base64," + data;
              savefile(data, cordova.file.documentsDirectory, $scope.imageName);

              // Buttons control
              $scope.pictureSelected = true;
              $scope.editButton = true;
              $scope.listButton = false;

              $scope.containerPic = true;
              $scope.containerShow = false;
          });

        };
        var failure = function(message){
            // Nenhuma imagem selecionada
            console.log('Error take picture: ' + JSON.stringify(message));
        };
        //call the cordova camera plugin to open the device's camera
        navigator.camera.getPicture( success , failure , cameraOptions );
    };

    $scope.editPicture = function(){

        $('.container > img').cropper({
            //aspectRatio: 1.25,
            strict: true,
            crop: function(data) {
              // Output the result data for cropping image.
              //console.log('w: ' + data.width + 'h: ' + data.height);
              $scope.hImage = data.height;
              $scope.wImage = data.width;
            }
        });

        $scope.tabTools = true;
        $scope.tabSource = false; // Hide source cam and gallery buttons
        $scope.editButton = false; // Hide edit button
        $scope.doneEditButton = true; // Show done button
        $scope.cancelEditButton = true; // Show done button
        $scope.listButton = false;

    };

    $scope.rotatePicture = function(degree){
        $('.container > img').cropper('rotate', degree);
    };

    $scope.doneEditPicture = function(){

        $scope.tabTools = false;
        $scope.tabSource = true; // Show source cam and gallery buttons
        $scope.editButton = true; // Hide edit button
        $scope.doneEditButton = false; // Hide done button
        $scope.cancelEditButton = false; // Hide done button
        $scope.listButton = true;

        if ($scope.wImage < 500){

            var alertPopup = $ionicPopup.alert({
               title: 'Alerta!',
               template: 'A imagem irá ficar muito pequena, cuidado para não afetar a qualidade.'
            });

        }

        // Update result image
        var canvas = $('.container > img').cropper('getCroppedCanvas');

        $('.container > img').cropper('destroy');

        $scope.cameraPic = canvas.toDataURL();

        // Save updated files
        var data = canvas.toDataURL().replace('data:image/png;base64,', '');
        savefile(data, cordova.file.documentsDirectory, $scope.imageName);


    };

    $scope.cancelEditPicture = function(){

        $scope.tabTools = false;
        $scope.tabSource = true; // Show source cam and gallery buttons
        $scope.editButton = true; // Hide edit button
        $scope.doneEditButton = false; // Hide done button
        $scope.cancelEditButton = false; // Hide cancel button
        $scope.listButton = true;

        $('.container > img').cropper('destroy');
    };

    $scope.sendPicture = function(){

        if (!$scope.pictureSelected){

            var alertPopup = $ionicPopup.alert({
               title: 'Alerta!',
               template: 'Imagem não selecionada.'
            });

        }else{
            $scope.openSend();
        }
    };

    function savefile(dataurl, path, filename){
        $ionicPlatform.ready(function() {
            $cordovaFile.writeFile(path, filename, dataurl, true).then( function(result) {
              console.log('Writefile success');

              GaleriaService.setImageURI(path + filename);

              $cordovaFile.readAsText(path, filename)
              .then(function (success) {
                console.log('Read file success: ');
              }, function (error) {
                console.log('ReadAsText error');
              });

            }, function(err) {
              console.log('Writefile Error... ' + JSON.stringify(err));
            }
          );
        });
    }

    function fail(e){
        console.log("Error: " + JSON.stringify(e));
    }

    $scope.list = function(){

      $state.go("app.list_galerias", {
          "galeriaId": $stateParams.galeriaId
      });
    }
})

.controller('GaleriaListCtrl', function($scope, $http, $rootScope, $state, $stateParams, $ionicGesture, $ionicPopup, $http, $ionicLoading, $ionicActionSheet, $cordovaSocialSharing, GaleriaService) {

  $scope.data = {};
  $scope.itemsSelected = [];

  $scope.$on('$ionicView.enter', function() {
    $scope.showImageList();
    $scope.selectedMode = false;
    $scope.multipleShareButton = false;
    $scope.multipleShareCancelButton = false;
  })

  $scope.showImageList = function(){

    $scope.loadingIndicator = $ionicLoading.show({
          content: $scope.loadingContent,
          animation: 'fade-in',
          showBackdrop: false,
          maxWidth: 200,
          showDelay: 500
    });

    $http.get($rootScope.apiURL + $rootScope.apiContext + "/admin/ws/galeria/list?galeriaID=" + $stateParams.galeriaId).then(function(resp) {

      GaleriaService.setArquivoGaleria(resp.data);
      $scope.arquivoGaleria = resp.data;

      $state.go('app.list_galerias');

      $ionicLoading.hide();

    }, function(err) {
      console.error('ERR', JSON.stringify(err));
    })
  }

  // Override $http service's default transformRequest
  $http.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];

  $scope.shareOptionsClick = function(arquivoGaleriaID, dsArquivoGaleria, path, file){

    $scope.data.dsArquivoGaleria = dsArquivoGaleria;

    if (!$scope.selectedMode){

      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: '<b>Compartilhar</b>' },
          { text: 'Editar' }
        ],
        destructiveText: 'Excluir',
        titleText: 'Escolha uma opção...',
        cancelText: 'Cancelar',
        cancel: function() {
            // add cancel code..
        },
        destructiveButtonClicked: function(){
            $ionicPopup.show({
              title: 'Excluir',
              subTitle: 'Tem certeza que deseja excluir esta foto?',
              scope: $scope,
              buttons: [
                { text: 'Não' },
                {
                  text: 'Sim',
                  type: 'button-positive',
                  onTap: function(e) {

                    $http.get($rootScope.apiURL + $rootScope.apiContext + "/admin/ws/galeria/excluirArquivoGaleria?arquivoGaleriaID=" + arquivoGaleriaID).then(function(resp) {

                      $scope.showImageList();

                    }, function(err) {
                      console.error('ERR', err);
                    })
                  }
                }
              ]
            });

            hideSheet();
        },
        buttonClicked: function(index) {

          if (index == 0){

            var imageShare = $rootScope.apiURL + '/' + $rootScope.apiContext + '/' + path + file;
            $scope.shareFiles([imageShare]);

          }else if (index == 1){ // Editar

            var editPopup = $ionicPopup.show({
              template: '<input type="text" ng-model="data.dsArquivoGaleria">',
              title: 'Descrição',
              subTitle: 'Informe a descrição da imagem',
              scope: $scope,
              buttons: [
                { text: 'Cancelar' },
                {
                  text: '<b>Salvar</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    if ($scope.data.dsArquivoGaleria) {
                      e.preventDefault();

                      var params = {
                        "dsArquivoGaleria": $scope.data.dsArquivoGaleria,
                        "arquivoGaleriaID": arquivoGaleriaID
                      }

                      $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

                      $http.post($rootScope.apiURL + $rootScope.apiContext + "/admin/ws/galeria/edit", params).success(function(response) {

                          editPopup.close();
                          $scope.showImageList();

                      });

                    }
                  }
                }
              ]
            });
          }

          hideSheet();

          return true;
        }
      });

    }else{
      $scope.markSelected(arquivoGaleriaID);
    }

  }

  $scope.shareFiles = function(images){

    $cordovaSocialSharing.share(null, null, images, null, function(){
      console.log('success');
      var alertPopup = $ionicPopup.alert({
         title: 'Sucesso',
         template: 'Imagem compartilhada com sucesso!'
      });
    }, function(err){
      console.log('err: ' + err);

      var alertPopup = $ionicPopup.alert({
         title: 'Erro',
         template: 'Erro ao compartilhar!'
      });
    });

  }

  $scope.onHold = function(element, id){
     $scope.markSelected(id);
  }

  $scope.markSelected = function(id){

    jQuery('#item_' + id + ' > a').css('background-color', 'gray');
    $scope.selectedMode = true;

    $scope.multipleShareButton = true;
    $scope.multipleShareCancelButton = true;

    $scope.itemsSelected.push(id);
  }

  $scope.unmarkSelected = function(id){
    jQuery('#item_' + id + ' > a').css('background-color', 'white');
  }

  $scope.multipleShareCancel = function(){

    $scope.selectedMode = false;

    $scope.multipleShareButton = false;
    $scope.multipleShareCancelButton = false;

    var itemsLenght = $scope.itemsSelected.length;
    for(var i=0; i < itemsLenght; i++){
      $scope.unmarkSelected($scope.itemsSelected[i]);
    }

    $scope.itemsSelected = [];

  }

  $scope.multipleShare = function(){

    var itemsLenght = $scope.itemsSelected.length;
    var imagesShare = [];
    for(var i=0; i < itemsLenght; i++){

      var arquivo = getArquivoGaleria($scope.arquivoGaleria, $scope.itemsSelected[i]);

      var imageShare = $rootScope.apiURL + '/' + $rootScope.apiContext + '/' + arquivo.galeria.path + arquivo.file;
      imagesShare.push(imageShare);
    }

    $scope.shareFiles(imagesShare);

  }

  function getArquivoGaleria(array, id){

    var length = array.length;
    for(var i=0; i < length; i++){

      var arquivo = array[i];
      if (arquivo.arquivoGaleriaID == id ){
        return arquivo;
      }
    }

  }

})

.factory('GaleriaService', function() {

    return {
        imageURI: {},
        arquivoGaleria: {},
        setImageURI : function(imageURI){
          this.imageURI = imageURI;
        },
        getImageURI: function(){
           return this.imageURI;
        },
        setArquivoGaleria : function(arquivoGaleria){
          this.arquivoGaleria = arquivoGaleria;
        },
        getArquivoGaleria: function(){
            return this.arquivoGaleria;
        }
    }
})