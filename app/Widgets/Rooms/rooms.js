var Rooms = {
    default_services: [],

    setDefaultServices: function (services) {
        Rooms.default_services = services;
    },

    toggleEdit: function () {
        document.querySelector('#rooms_widget ul.list.rooms').classList.toggle('edition');
    },

    checkNoConnected: function () {
        if (
            !document.querySelector('#rooms_widget ul.list.rooms li.connected')
            && localStorage.getItem('rooms_all') == 'true'
        ) {
            document.querySelector('#rooms_widget ul.list.rooms').classList.add('all');
        }
    },

    toggleShowAll: function () {
        document.querySelector('#rooms_widget ul.list.rooms').classList.toggle('all');
        localStorage.setItem('rooms_all', document.querySelector('#rooms_widget ul.list.rooms').classList.contains('all'));

        Rooms.displayToggleButton();
    },

    displayToggleButton: function () {
        document.querySelectorAll('#rooms_widget span.chip').forEach(chip => {
            chip.classList.remove('enabled');
        });

        if (localStorage.getItem('rooms_all') == 'true') {
            document.querySelector('#rooms_widget span.chip[data-filter=all]').classList.add('enabled');
        } else {
            document.querySelector('#rooms_widget span.chip[data-filter=connected]').classList.add('enabled');
        }
    },

    selectGatewayRoom: function (room, name) {
        document.querySelector('form[name="bookmarkmucadd"] input[name=jid]').value = room;
        document.querySelector('form[name="bookmarkmucadd"] input[name=name]').value = name;
    },

    setJid: function (slugifiedJid) {
        let input = document.querySelector('form[name=bookmarkmucadd] input[name=jid]');

        if (input && input.value === '') {
            input.value = slugifiedJid;
        }
    },

    suggest: function () {
        let input = document.querySelector('form[name=bookmarkmucadd] input[name=jid]');

        if (input && input.value != '' && !input.value.includes('@')) {
            let suggestions = document.querySelector('datalist#suggestions');
            if (suggestions) {
                suggestions.textContent = '';

                Rooms.default_services.forEach(function (item) {
                    var option = document.createElement('option');
                    option.value = input.value + '@' + item.server;
                    suggestions.appendChild(option);
                });
            }
        }
    },

    refresh: function () {
        Rooms.displayToggleButton();

        var list = document.querySelector('#rooms_widget ul.list.rooms');
        var items = document.querySelectorAll('#rooms_widget ul.list.rooms li:not(.subheader)');
        var i = 0;

        var differentStates = false;
        list.classList.remove('different_states');

        while (i < items.length) {
            if (items[i].dataset.jid != null) {
                items[i].onclick = function (e) {
                    Chat.getRoom(this.dataset.jid);
                }
            }


            if (
                i >= 1
                && !differentStates
                && items[i - 1].classList.contains('connected') != items[i].classList.contains('connected')
            ) {
                differentStates = true;
            }

            items[i].classList.remove('active');

            i++;
        }

        if (differentStates) {
            list.classList.add('different_states');
        } else {
            Rooms.checkNoConnected();
        }
    },

    clearRooms: function () {
        document.querySelector('#rooms_widget ul.list.rooms').innerHTML = '';
    },

    setRoom: function (id, html) {
        var listSelector = '#rooms_widget ul.list.rooms ';
        var list = document.querySelector(listSelector);
        var element = list.querySelector('#' + id);

        if (element) element.remove();

        var rooms = document.querySelectorAll(listSelector + '> li');
        var i = 0;

        while (i < rooms.length) {
            if (rooms[i].id > id) {
                MovimTpl.prependBefore(listSelector + '#' + rooms[i].id, html);
                break;
            }

            i++;
        }

        if (i == rooms.length) {
            MovimTpl.append(listSelector, html);
        }

        Rooms.refresh();
    },

    clearAllActives: function() {
        document.querySelectorAll('#rooms_widget ul.list.rooms li:not(.subheader)')
            .forEach(item => item.classList.remove('active'));
    },

    setActive: function (jid) {
        Chats.clearAllActives();
        Rooms.clearAllActives();
        MovimUtils.addClass('#rooms_widget ul.list.rooms li[data-jid="' + jid + '"]', 'active');
    },

    setUnread: function (id, unread) {
        var element = document.querySelector('#rooms_widget ul.list.rooms #' + id);

        if (element) {
            if (unread) {
                element.classList.add('unread');
            } else {
                element.classList.remove('unread');
            }
        }
    }
}

MovimWebsocket.initiate(() => {
    Rooms_ajaxHttpGet()
    Rooms.checkNoConnected();
});
