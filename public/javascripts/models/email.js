/*
 * Copyright (C) 2012 Xavier Antoviaque <xavier@antoviaque.org>
 *
 * This software's license gives you freedom; you can copy, convey,
 * propagate, redistribute and/or modify this program under the terms of
 * the GNU Affero Gereral Public License (AGPL) as published by the Free
 * Software Foundation (FSF), either version 3 of the License, or (at your
 * option) any later version of the AGPL published by the FSF.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program in a file in the toplevel directory called
 * "AGPLv3".  If not, see <http://www.gnu.org/licenses/>.
*/

(function($) {

    $.inbox = {}
    
    // Models //////////////////////////////////////////////////////////////
        
    $.inbox.Message = Backbone.RelationalModel.extend({
        urlRoot: '/api/inbox',
        idAttribute: '_id',
    });

    $.inbox.Thread = Backbone.RelationalModel.extend({
        urlRoot: '/api/inbox',
        idAttribute: '_id',
        relations: [{
            type: Backbone.HasMany,
            key: 'messages',
            relatedModel: '$.inbox.Message',
            reverseRelation: {
                key: 'emails',
                includeInJSON: '_id',
            },
        }]
    });
    
    $.inbox.ThreadCollection = Backbone.Collection.extend({
        url: '/api/inbox',
        model: $.inbox.Thread,
    })
    
    // Views ///////////////////////////////////////////////////////////////
    
    // Threads list //
    
    $.inbox.ThreadListView = Backbone.View.extend({
        tagName: 'div',

        className: 'thread_list_view',
        
        initialize: function(){
            _.bindAll(this, 'render', 'render_email', 'on_submit', 'on_thread_created', 'on_error');
            this.model.bind('reset', this.render); 
            this.model.bind('change', this.render); 
            this.model.bind('add', this.render_email); 
        },
    
        template: Handlebars.compile($('#tpl_thread_list').html()),
    
        render: function() {
            $(this.el).html(this.template());
            this.model.forEach(this.render_email);
            return $(this.el).html();
        },
        
        render_email: function(inbox) {
            var thread_summary_view = new $.inbox.ThreadSummaryView({model: inbox});
            this.$('ul.thread_list').prepend($(thread_summary_view.render()));
        },
        
        events: {
            'click input[type=submit]': 'on_submit',
        },
        
        on_submit: function(e) {
            var thread = new $.inbox.Thread({ title: this.$('.new_thread_title').val() });
            thread.save({}, { success: this.on_thread_created,
                              error: this.on_error });
        },
        
        on_thread_created: function(inbox, response) {
            this.model.add(thread, {at: 0});
            var message = new $.inbox.Message({ author: this.$('.new_message_author').val(),
                                                 text: this.$('.new_message_text').val(),
                                                 inbox: inbox.get('_id') });
            message.save({}, { 
                success: function() {
                    $.inbox.app.navigate('/body/'+inbox.get('_id')+'/', { trigger: true });
                },
                error: this.on_error,
            });
        },
                
        on_error: function(model, response) {
            var error = $.parseJSON(response.responseText);
            this.$('.error_message').html(error.message);
        },
    });
    
    // Thread //
    
    $.inbox.ThreadSummaryView = Backbone.View.extend({
        tagName: 'div',

        className: 'thread_summary_view',
        
        initialize: function(){
            _.bindAll(this, 'render', 'on_click');
            this.model.bind('change', this.render);
        },
    
        template: Handlebars.compile($('#tpl_thread_summary').html()),
        
        render: function() {
            return $(this.el).html(this.template(this.model.toJSON()));
        },
        
        events: {
            'click': 'on_click',
        },
        
        on_click: function(e) {
            $.inbox.app.navigate('/body/'+this.model.get('UID'), {trigger: true});
        },
    });
    
    $.inbox.ThreadView = Backbone.View.extend({
        tagName: 'div',

        className: 'thread_view',
        
        initialize: function(){
            _.bindAll(this, 'render', 'render_message', 'on_submit');
            this.model.bind('change', this.render);
            this.model.bind('reset', this.render);
            this.model.bind('add:messages', this.render_message); 
        },
    
        template: Handlebars.compile($('#tpl_thread').html()),
        
        render: function() {
            return $(this.el).html(this.template(this.model.toJSON()));
        },
        
        render_message: function(message) {
            var message_view = new $.inbox.MessageView({model: message});
            this.$('div.message_list').append($(message_view.render()));
        },
        
        events: {
            'click input[type=submit]': 'on_submit',
        },
        
        on_submit: function(e) {
            var new_message = new $.inbox.Message({author: this.$('.new_message_author').val(),
                                                    text: this.$('.new_message_text').val(),
                                                    inbox: this.model});
            new_message.save();
        },
    });
    
    // Message //
    
    $.inbox.MessageView = Backbone.View.extend({
        tagName: 'div',

        className: 'message_view',
        
        initialize: function(){
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },
    
        template: Handlebars.compile($('#tpl_message').html()),
        
        render: function() {
            return $(this.el).html(this.template(this.model.toJSON()));
        },
    });
    
    // Router ///////////////////////////////////////////////////////////////
    
    $.inbox.Router = Backbone.Router.extend({
        routes: {
            "": "show_thread_list",
            "body/:_id/": "show_thread",
        },
    
        show_thread_list: function() {
            var thread_collection = new $.inbox.ThreadCollection();
            var thread_list_view = new $.inbox.ThreadListView({el: $('#content'), 
                                                                model: thread_collection });
            thread_collection.fetch();
        },
        
        show_thread: function(_id) {
            var thread = new $.inbox.Thread({_id: _id});
            var thread_view = new $.inbox.ThreadView({el: $('#content'), model: inbox});
            inbox.fetch();
        },
        
    });
    
    
    // App /////////////////////////////////////////////////////////////////
    
    $.inbox.app = null;
    
    $.inbox.bootstrap = function() {
        $.inbox.app = new $.inbox.Router(); 
        Backbone.history.start({pushState: true});
    };

})(jQuery);

