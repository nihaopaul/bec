
function WebmailViewModel() {
    // Data
    var self = this;
    self.folders = ko.observableArray();
    self.chosenFolderId = ko.observable();
    self.chosenFolderData = ko.observableArray();
    self.chosenMailData = ko.observable();
    self.selectedTitle = ko.observable();
    self.usedIDS = ko.observableArray();

    self.login = ko.observable(true);


    self.chosenFolderId.subscribe(function(data) {
        if (data && data.error != null) {
            location = '/login'; 
        }
    });


    self.chosenFolderData.subscribe(function(data) {
        if (data && data.error != null) {
            location = '/login'; 
        }
        if (data) {
            self.usedIDS = {};
            for(var i=0;i<data.length;i++){

                if (data[i].references) {
                    $.each(data[i].references, function(num, value){
                      self.chosenFolderData.remove(function(item) { return item.messageId == value });
                    });
                } 
               // self.chosenFolderData.remove(function(item) { return item.messageId == value });
            }

            self.selectedTitle(data[0]);
        } else {
            self.selectedTitle(null);
        }
    });
    self.folders.subscribe(function(data) {
        if (data && data.error != null) {
            location = '/login'; 
        }
    });

    // Behaviours    
    self.goToFolder = function(folder) { /*location.hash = '/'*/
        location.hash = '/'+folder.path;
    };

    self.goToNav = function(data, value) {
        //37 l , 38 u , 39 r, 40 d

        folders = data.folders();
        current = data.chosenFolderId();
        selected = data.selectedTitle();
        folderdata = data.chosenFolderData();
        switch(value.keyCode) {
            case 37:
                //left
                for(var i=0;i<folders.length;i++){
                   // console.log(data.folders);
                    if (folders[i].path == current) {
                        pos = i;
                        if (pos == 0) {
                            pos = folders.length-1;
                        } else {
                            pos --;
                        }
                        data.goToFolder(folders[pos]);
                    }
                }
                return false;
            break;
            case 38:
                //up
                if (folderdata == null) {
                    return true
                }
                for(var i=0;i<folderdata.length;i++){
                    if (folderdata[i] == selected) {
                        pos = i;
    
                        if (pos == 0) {
                            pos = folderdata.length-1;
                        } else {
                            pos --;
                        }
                        data.selectedTitle(folderdata[pos]);
                    }
                }
                return false;
            break;
            case 39:
                //right
                for(var i=0;i<folders.length;i++){
                    if (folders[i].path == current) {
                        pos = i;
    
                        if (pos == folders.length-1) {
                            pos = 0;
                        } else {
                            pos ++;
                        }
                        data.goToFolder(folders[pos]);
                    }
                }
                return false;
            break;
            case 40:
                //down
                if (folderdata == null) {
                    return true
                }
                for(var i=0;i<folderdata.length;i++){
                    if (folderdata[i] == selected) {
                        pos = i;
    
                        if (pos == folderdata.length-1) {
                            pos = 0;
                        } else {
                            pos ++;
                        }
                        data.selectedTitle(folderdata[pos]);
                    }
                }
                return false;

            break;
            case 13:
                if (folderdata == null) {
                    return true
                }
                for(var i=0;i<folderdata.length;i++){
                    if (folderdata[i] == selected) {
                        data.goToMail(folderdata[i]);
                    }
                }
                
                return false;
            break;
            case 8:
                //delete - should find backspace key
                if (folderdata == null) {

                    return false;
                }
                return true;
            break;
            default:
                console.log("keycode: " + value.keyCode);
                return true;
        }
        switch(value.charCode) {
            case 32:
                //space has been pushed
                $(".main").show();
                $(".viewMail").hide();
                return true;
            break;
            default: 
                console.log("charcode: " + value.charCode);
                return true;
        }
    };

    //self.goToMail = function(mail) { location.hash = mail.folder + '/' + mail.UID };
    self.goToMail = function(mail) { 
        //console.log(mail);
        location.hash = '/'+mail.path + '/body/' + mail.UID; 
    };



    self.formattext = function(text){ 
        text = text.toString();
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return text; 
    };


    self.formattime = function(datetime) {
        var time = moment(datetime);
        var now = moment();

        var difference = now.diff(time, 'hours');
        if (difference <= 24) {
            return time.fromNow();
        } else if (difference <= 24*7) {
            return time.format("ddd, h:mmA");
        } else {
            return time.format("DD/MM/YY, h:mmA");
            //return time.format("YYYY/MM/DD hh:mmA ZZ");
        }
    }



    $.get("/api/mailboxes", self.folders);
    // Client-side routes    
    Sammy(function() {
        debug = true,
        this.get('#/login', function() {
            self.login(true);
        });
        this.get('#/:folder', function() {
            //self.chosenFolderId(this.params.folder);
            self.chosenFolderId(this.params.folder);
            self.chosenMailData(null);
            //$.get("/api/inbox", { folder: this.params.folder }, self.chosenFolderData);
            if ( this.params.folder ) {
                $.get("/api/inbox", { folder: this.params.folder }, self.chosenFolderData);
            } else {
                $.get("/api/inbox", self.chosenFolderData);
            }
            $(".main").show();
            $(".viewMail").hide();
        });

        this.get('#/:folder/body/:UID', function() {
            self.chosenFolderId(this.params.folder);
            self.chosenFolderData(null);

            if ( this.params.folder ) {
                $.get("/api/body", { folder: this.params.folder, UID: this.params.UID }, self.chosenMailData);
            } else {
                $.get("/api/body", { UID: this.params.UID }, self.chosenMailData);
            }
            $(".main").hide();
            $(".viewMail").show();

        });
    
        this.get('', function() { this.app.runRoute('get', '/#/INBOX') });
    }).run();    
};

ko.applyBindings(new WebmailViewModel());

