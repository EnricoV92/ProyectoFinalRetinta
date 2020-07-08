/**
 * @file Administracion de socket, junto con todos sus eventos.
 * @name websocket-server
 * @requires path,fs,wav,socket.io,classRec-controller,class-controller
 * @author ReTinta
 * @version 1.0.0 
 */

/**
 * @function WebSocketServerInit() - Administra el websocket
 * @param {Object} classServers - Servidores donde se esta activo el socket
 * @memberof websocket-server
 * @instance
 */
function WebSocketServerInit (classServers)
{

    const path = require('path'),
        fs = require('fs'),
        wav = require('wav'),
        io = require('socket.io')(classServers),
        ClassControllerRec = require(path.join(__dirname, 'controllers', 'classRec-controller')),
        ClassController = require(path.join(__dirname, 'controllers', 'class-controller')),

        events = {
            connectionOpen: 'connection',
            connectionClose: 'close',
            newMessage: 'newMessage',
            saveScreen: 'saveScreen',
            newSegment: 'newSegment',
            newLetter: 'newLetter',
            endOfStroke: 'endOfStroke',
            endOfLetter: 'endOfLetter',
            initialLoad: 'initialLoad',
            undo: 'undo',
            redo: 'redo',
            ratingRequest: 'ratingRequest',
            savedScreensRequest: 'savedScreensRequest',
            currentScreensRequest: 'currentScreensRequest',
            questionnaire: 'questionnaire',
            answer: 'answer',
            server: 'server',
            client: 'client',
            save: 'save',
            message: 'message',
            disconnecting: 'disconnecting',
            audio: 'audio',
            audioYes: 'audioYes',
            saveQuestionnaire: 'saveQuestionnaire',
            salte: 'salte',
            role: 'role',
            numberOfStudents: 'numberOfStudents',
            disconnection: 'disconnection',
            deleteWindow: 'deleteWindow',
            newScreen: 'newScreen',
            classStartTime: 'classStartTime'
        };
    //let drawings = [];

    let drawings = {};
    // let drawing = {
    //     type: 'trazo o letra'
    //     data: 'data de letra o [trazo(array de mov)]'
    // }
    var strokes = {},
        undoDrawings = {},
        drawingsToStore = {},
        messages = {},
        classDurations = {},
        fileWriters = {},
        classServers = {};
    classFinishedServers = {};


    io.on(events.connectionOpen, function connection (socket)
    {


        socket.on(events.audioYes, (data) =>
        {
            classDurations[socket.id] = data.classStartTime
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            let savePath = path.join(__dirname, 'uploads', 'audios', `${ data.owner }`)
            if (!fs.existsSync(savePath))
            {
                fs.mkdirSync(savePath)
            }
            savePath = path.join(savePath, `${ room }`)
            if (!fs.existsSync(savePath))
            {
                fs.mkdirSync(savePath)
            }

            fileWriters[ room ] = new wav.FileWriter(path.join(savePath, 'audio.wav'), {
                channels: 1,
                sampleRate: 44100,
                bitDepth: 16
            });
            socket.broadcast.to(room).emit(events.classStartTime, { classStartTime: data.classStartTime });
            socket.broadcast.to(room).emit(events.audio, {});
        });
        socket.on(events.role, (data) =>
        {
            socket.leave(socket.id)
            socket.join(data.classId)
            if (classFinishedServers[ data.classId ])
            {
                socket.emit(events.salte, {})
            } else
            {
                //console.log("Cliente conectado");
                if (!drawings[ data.classId ]) drawings[ data.classId ] = [];
                let d = drawings[ data.classId ];
                if (!messages[ data.classId ]) messages[ data.classId ] = [];
                let m = messages[ data.classId ];

                socket.emit(events.initialLoad, { chat: m, drawings: d });
                //console.log("Chat y Lienzo enviados");
                //console.log('Sala: ' + data.classId)
                if (data.server)
                {
                    //if (io.sockets.adapter.rooms[data.classId].length == 1) {
                    //console.log('Es Server');
                    classServers[ data.classId ] = `${ socket.id }`;
                    classDurations [data.classId] = 0
                    if (io.sockets.connected[ socket.id ])
                        io.sockets.connected[ socket.id ].emit(events.role, { 'role': 'server' });
                } else
                {
                    //console.log('Es Cliente')
                    if (io.sockets.connected[ socket.id ])
                    {
                        io.sockets.connected[ socket.id ].emit(events.role, { 'role': 'client' });
                        let number = io.sockets.adapter.rooms[ data.classId ].length - 1;
                        io.to(data.classId).emit(events.numberOfStudents, { 'students': number });
                    }
                }
            }

        });

        socket.on(events.client, (data) =>
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ] //nombre sala del socket emisor
            if (io.sockets.connected[ socket.id ])
                io.sockets.connected[ socket.id ].emit(events.server, { destination: classServers[ room ] });
            if (io.sockets.connected[ classServers[ room ] ])
                io.sockets.connected[ classServers[ room ] ].emit(events.client, { destination: socket.id });
        });

        socket.on(events.save, (track) =>
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (classServers[ room ])
            {
                fileWriters[ room ].write(track);
            }
        });

        socket.on(events.classStartTime, (data) =>
        {
            if (io.sockets.connected[ data.destination ])
                io.sockets.connected[ data.destination ].emit(events.classStartTime, { classStartTime: data.classStartTime });
        });

        socket.on(events.message, (data) =>
        {
            if (io.sockets.connected[ data.destination ])
            {
                data.origin = socket.id;
                io.sockets.connected[ data.destination ].emit(events.message, data);
            }

        });

        socket.on(events.disconnecting, (data) =>
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (socket.id == classServers[ room ])
            {
                if (!drawings[ room ]) drawings[ room ] = [];
                if (drawings[ room ].length > 0)
                    ClassControllerRec.storeStrokes(room, drawings[ room ]);
                let duration = Date.now() - Number(classDurations[socket.id])
               
                ClassController.classEndByErr(room,duration);
                
                socket.broadcast.to(room).emit(events.ratingRequest, Date.now());
                delete classDurations[socket.id]
                delete classServers[ room ]
                classFinishedServers[ room ] = true
                delete drawings[ room ]
                delete strokes[ room ]
                delete undoDrawings[ room ]
                delete drawingsToStore[ room ]
                delete messages[ room ]
                if (fileWriters[ room ] != null)
                {
                    fileWriters[ room ].end()
                    delete fileWriters[ room ]
                }
            } else
            {
                if (io.sockets.connected[ classServers[ room ] ])
                {
                    let number = io.sockets.adapter.rooms[ room ].length - 2;
                    socket.broadcast.to(room).emit(events.numberOfStudents, { 'students': number });
                    io.sockets.connected[ classServers[ room ] ].emit(events.disconnection, socket.id)
                }

            }
            setTimeout(() => { delete classFinishedServers[ room ] }, 300000);//5 minutos
        });

        socket.on(events.newSegment, function (segmentData)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            newSegment(segmentData, room);
            socket.broadcast.to(room).emit(events.newSegment, segmentData);
        });

        socket.on(events.endOfStroke, function (incomingMessage)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!strokes[ room ] || strokes[ room ].length == 0)
            {
                strokes[ room ] = [];
            } else
            {
                let drawing = {
                    'type': 'stroke',
                    'data': strokes[ room ],
                }
                if (!drawings[ room ]) drawings[ room ] = [];
                drawings[ room ].push(drawing);
                strokes[ room ] = [];
            }

        });

        socket.on(events.newLetter, function (letterData)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            let drawing = {
                'type': 'letter',
                'data': letterData,
            }
            if (!drawings[ room ]) drawings[ room ] = [];
            drawings[ room ].push(drawing);
            socket.broadcast.to(room).emit(events.newLetter, letterData);
        });

        socket.on(events.newMessage, function (incomingMessage)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!messages[ room ]) messages[ room ] = [];
            messages[ room ].push(incomingMessage);
            socket.broadcast.to(room).emit(events.newMessage, incomingMessage);
            if (incomingMessage)
                ClassControllerRec.storeChat(room, incomingMessage)
        });

        socket.on(events.undo, function (drawing)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!drawings[ room ]) drawings[ room ] = [];
            if (!undoDrawings[ room ]) undoDrawings[ room ] = [];
            var aux = exchange(drawings[ room ], undoDrawings[ room ]);
            if (aux.res)
            {
                drawing = aux.arrayFrom;
                io.to(room).emit(events.undo, drawing);
            }


        });

        socket.on(events.redo, function (drawing)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!drawings[ room ]) drawings[ room ] = [];
            if (!undoDrawings[ room ]) undoDrawings[ room ] = [];
            var aux = exchange(undoDrawings[ room ], drawings[ room ]);
            if (aux.res)
            {
                drawing = aux.aux;
                io.to(room).emit(events.redo, drawing);
            }

        });

        socket.on(events.savedScreensRequest, function (incomingMessage)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!drawingsToStore[ room ]) drawingsToStore[ room ] = [];
            incomingMessage = drawingsToStore[ room ];
            socket.emit(events.savedScreensRequest, incomingMessage);
        });

        socket.on(events.currentScreensRequest, function (screenData)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            if (!drawings[ room ]) drawings[ room ] = [];
            screenData = drawings[ room ];
            socket.emit(events.currentScreensRequest, screenData);
        });

        socket.on(events.saveScreen, function (incomingMessage)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            // console.log(socket.rooms);
            // var roomKeys = Object.keys(socket.rooms);
            // console.log(roomKeys);
            //console.log("ClassId: " + incomingMessage);
            //if(!drawings[room])drawings[room] = [];
            if (drawings[ room ].length > 0)
            {
                ClassControllerRec.storeStrokes(incomingMessage, drawings[ room ]);
                cleanCanvas(room);
                socket.broadcast.to(room).emit(events.saveScreen, incomingMessage);
            }
        });

        socket.on(events.ratingRequest, function (data)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ]
            socket.broadcast.to(room).emit(events.ratingRequest, data);
        });
        socket.on(events.questionnaire, function (questionnaire)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ];
            let number = io.sockets.adapter.rooms[ room ].length - 1;
            io.sockets.connected[ socket.id ].emit(events.numberOfStudents, { 'students': number });
            socket.broadcast.to(room).emit(events.questionnaire, questionnaire);

        });

        socket.on(events.answer, function (answer)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ];
            io.sockets.connected[ classServers[ room ] ].emit(events.answer, answer);
        });

        socket.on(events.deleteWindow, function (data)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ];
            socket.broadcast.to(room).emit(events.deleteWindow, {});
        });

        socket.on(events.saveQuestionnaire, function (data)
        {
            ClassController.saveQuestionnaire({ 'data': data, 'classId': socket.rooms[ Object.keys(socket.rooms)[ 0 ] ] });
        });

        socket.on(events.newScreen, function (data)
        {
            let room = socket.rooms[ Object.keys(socket.rooms)[ 0 ] ];
            let d = drawings[ room ];
            socket.emit(events.newScreen, { drawings: d });
        });



    });

    //Auxiliary methods
    function cleanCanvas (room)
    {
        if (!drawingsToStore[ room ]) drawingsToStore[ room ] = [];
        drawingsToStore[ room ].push(drawings[ room ]);
        if (!drawings[ room ]) drawings[ room ] = [];
        drawings[ room ] = [];
        if (!undoDrawings[ room ]) undoDrawings[ room ] = [];
        undoDrawings[ room ] = [];
    }

    /* function initialLoad() {
         let room = this.rooms[Object.keys(this.rooms)[0]];
         console.log('mi sala es: '+room)
         if(!drawings[room])drawings[room] = [];
         let d = drawings[room]
         if(!messages[room])messages[room] = [];
         let m = messages[room]
         const data = {
             chat: m,
             drawings: d
         };
         this.emit(events.initialLoad, data);
     }*/

    function newSegment (segment, room)
    {
        if (!strokes[ room ]) strokes[ room ] = [];
        strokes[ room ].push(segment);
    }

    function exchange (arrayFrom, arrayTo)
    {
        if (arrayFrom.length > 0)
        {
            var aux = arrayFrom.pop();
            arrayTo.push(aux);
            return {
                arrayFrom: arrayFrom,
                aux: aux,
                res: true
            }
        }
        return {
            res: false
        }
    }
}

module.exports = {
    WebSocketServerInit
}
