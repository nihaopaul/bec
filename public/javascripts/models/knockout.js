
function WebmailViewModel() {
    // Data
    var self = this;
    self.folders = ko.observableArray();
    self.chosenFolderId = ko.observable();
    self.chosenFolderData = ko.observable();
    self.chosenMailData = ko.observable();

    // Behaviours    
    self.goToFolder = function(folder) { /*location.hash = '/'*/
        location.hash = '/'+folder.path;
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
            return time.format("YYYY/MM/DD hh:mm:ssA ZZ");
        }
    }

    self.formatEmails = function(text){
        var addresses = [];
        for (var key in text) {
          if (text.hasOwnProperty(key)) {
            //address: "indoorbandy@hotmail.com",name:"Indoor Bandy Shanghai"
            //addresses.push(text[key].name + " <"+text[key].address+">")
            addresses.push(text[key]);
            console.log(text);
          }
        }
        if (addresses.length > 0) {
            return addresses;
        } else {
            return 'Unknown';
        }
    };

    $.get("/api/mailboxes", self.folders);
    // Client-side routes    
    Sammy(function() {
        this.get('#/:folder', function() {
            //self.chosenFolderId(this.params.folder);
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
            //self.chosenFolderId(this.params.folder);
            //self.chosenFolderData(null);

            if ( this.params.folder ) {
                $.get("/api/body", { folder: this.params.folder, UID: this.params.UID }, self.chosenMailData);
            } else {
                $.get("/api/body", { UID: this.params.UID }, self.chosenMailData);
            }
            $(".main").hide();
            $(".viewMail").show();

        });
    
        this.get('', function() { this.app.runRoute('get', '#/Inbox') });
    }).run();    
};

ko.applyBindings(new WebmailViewModel());

