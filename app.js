const {
    createBot,
    createProvider,
    createFlow,
    addKeyword,
} = require('@bot-whatsapp/bot')

require('dotenv').config()
const ChatGPTClass = require('./chatgpt.class')
const CHATGPT = require('./chatgpt')


const createBotGPT = async ({
    provider,
    database
}) => {
    return new ChatGPTClass(database, provider);
};
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

// Google sheet npm package
const {
    GoogleSpreadsheet
} = require('google-spreadsheet');

// File handling package
const fs = require('fs');

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = '150eXGREbkwObNWqk2fpXj3P672yhzBzNHZ0uwMpfyNQ';

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('botsilver-3e4bc3162de9.json'));


//**VARIABLES
let STATUS = {}
// let nombre = STATUS[ctx.fro]
// let mensaje
// let rango
// let domicilio
// let respuestaConsulta
// let visita
// let fechaElegida
// let fechasActualizadas
//VARIABLES**\\





//**FUNCIONES

//Trae la información del excel
const getRowConsulta = async (nombre) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    // Get all the rows
    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        let objetoConsulta = {
            Fecha: row.FECHA_VISITA_LLAMADO,
            Turno: row.TURNO,
            Domicilio: row.DOMICILIO
        }
        if (row.NOMBRE_CLIENTE == nombre && row.RESULTADO == 'CONCRETADO') {


            return objetoConsulta
        }

    };

    return 'NO HAY NADA'
};

//Busca con el número de teléfono el nombre del cliente en la base
const saveClientName = async (número) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet1 = doc.sheetsByIndex[1];

    // Get all the rows
    let rows1 = await sheet1.getRows();

    for (let index = 0; index < rows1.length; index++) {
        const row = rows1[index];
        if (row.Número == número) {
            return row.Nombre;
        }
    };
    return 'Teléfono no existe en Base de datos'
};

//Busca el listado de fechas en la sheet
const saveFechasExcel = async () => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    const sheet3 = doc.sheetsByIndex[3];

    // Get all the rows
    const rows3 = await sheet3.getRows();

    return rows3[2]._rawData

}

//Agrega un registro en la pestaña de Pendientes para Asesor
const addRowAsesor = async (row) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();


    // Index of the sheet
    let sheet2 = doc.sheetsByIndex[2];

    await sheet2.addRow(row);

};

//Agrega un registro en la Pestaña de Visitas concretadas
const addRowVisita = async (row) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet4 = doc.sheetsByIndex[4];


    await sheet4.addRow(row);

};

//Mofifica la Base con resultado/Turno/Fecha/Domicilio
const modificaBase = async (visita) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.NOMBRE_CLIENTE == visita.Nombre) {

            row.FECHA_VISITA_LLAMADO = visita.Fecha
            row.TURNO = visita.RangoHorario
            row.DOMICILIO = visita.Domicilio
            row.RESULTADO = 'CONCRETADO POR BOT'
            await rows[index].save(); // save updates
        }
    };


};

const modificaBaseFueraDeZona = async (nombre, resultado, domicilio) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.NOMBRE_CLIENTE == nombre) {

            row.RESULTADO = resultado
            row.DOMICILIO = domicilio
            await rows[index].save(); // save updates
        }
    };


};

const modificaBaseResultado = async (visita, resultado) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.NOMBRE_CLIENTE == visita.Nombre) {

            row.RESULTADO = resultado
            await rows[index].save(); // save updates
        }
    };


};

//Busca el domicilio con el nombre
const getDomicilioByName = async (nombre) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    // Get all the rows
    let rows = await sheet.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.NOMBRE_CLIENTE == nombre) {
            return row.DOMICILIO
        }
    };
    return 'Teléfono no existe en la base'
};
//FUNCIONES**\\

//**FLOWS\\

const flowComprobante = addKeyword(['entregue', '5', 'comprobante'])
    .addAnswer(['Perfecto! Por favor faciliteme una foto clara del comprobante y escriba Enviado.'], {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {

        nombre = await saveClientName(ctx.from);

        visita = {
            Nombre: nombre,
            Teléfono: ctx.from,
            Mensaje: 'Comprobante presentado'
        }
        addRowAsesor(visita)

        modificaBaseResultado(visita, 'COMPROBANTE PRESENTADO')

        return flowDynamic('Muchas gracias. Quedará asentado.')
    })

const flowConsulta = addKeyword(['consulta', '3'])
    .addAnswer(['Consultando si tiene una cita pactada....'], null, async (ctx, {
        flowDynamic
    }) => {


        nombre = await saveClientName(ctx.from)
        respuestaConsulta = await getRowConsulta(nombre)

        if (respuestaConsulta === 'NO HAY NADA') {

            flowDynamic([{
                body: 'No hay una visita agendada asociada a este número de teléfono',
                buttons: [{
                    body: '⬅️ Volver al inicio'
                }]
            }])

        } else {


            flowDynamic([{
                    body: 'Tiene una visita programada'
                },
                {
                    body: 'Fecha programada: ' + respuestaConsulta.Fecha
                },
                {
                    body: 'Turno programado: ' + respuestaConsulta.Turno
                },
                {
                    body: 'En el domicilio: ' + respuestaConsulta.Domicilio,
                    buttons: [{
                        body: '⬅️ Volver al inicio'
                    }]
                },

            ])
        }
    })

const flowAsesor = addKeyword(['asesor', 'humano', '2'])
    .addAnswer([
        'Lamento no poder ayudarlo'
    ])
    .addAnswer([
            'Por favor escriba su consulta '
        ], {
            capture: true
        },
        async (ctx, {
            flowDynamic,
            endFlow
        }) => {
            mensaje = ctx.body
            nombre = await saveClientName(ctx.from);

            visita = {
                Nombre: nombre,
                Teléfono: ctx.from,
                Mensaje: mensaje
            }
            addRowAsesor(visita)

            return flowDynamic([{
                body: 'Un asesor se comunicará lo antes posible. Muchas gracias',
                buttons: [{
                    body: '⬅️ Volver al Inicio'
                }],
            }, ])
            // return endFlow()
        })


const flowCambioDomicilio = addKeyword('Cambiar')
    .addAnswer('Escriba por favor calle, número y localidad *EN UN SOLO RENGLÓN* (CABA o CAPITAL si corresponde)', {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {


        if (ctx.body.toLowerCase().includes('caba') || ctx.body.toLowerCase().includes('capital') || ctx.body.toLowerCase().includes('belgrano') || ctx.body.toLowerCase().includes('palermo')) {



            STATUS[ctx.from] = {
                    ...STATUS[ctx.from],
                    domicilio: ctx.body

                },



                STATUS[ctx.from].visita = {
                    Nombre: STATUS[ctx.from].nombre,
                    Fecha: STATUS[ctx.from].fechaElegida,
                    RangoHorario: STATUS[ctx.from].rango,
                    Domicilio: STATUS[ctx.from].domicilio,
                    telefono: STATUS[ctx.from].telefono
                }





            await modificaBase(STATUS[ctx.from].visita)
            await addRowVisita(STATUS[ctx.from].visita)

            return flowDynamic(`Estupendo *${STATUS[ctx.from].nombre}*! te dejo el resumen de tu formulario
            \n- Fecha agendada: *${STATUS[ctx.from].fechaElegida}*
            \n- Rango horario seleccionado: *${STATUS[ctx.from].rango}*
            \n- Domicilio: *${STATUS[ctx.from].domicilio}*
            \n\n- Si encuentra algún problema no dude en iniciar nuevamente el asistente*`)

        } else {

            STATUS[ctx.from].visita = {
                Nombre: STATUS[ctx.from].nombre,
                Fecha: STATUS[ctx.from].fechaElegida,
                RangoHorario: STATUS[ctx.from].rango,
                Domicilio: ctx.body,
                telefono: STATUS[ctx.from].telefono
            }


            STATUS[ctx.from].visita = {
                Nombre: STATUS[ctx.from].nombre,
                Teléfono: ctx.from,
                Cita_Obs: `${STATUS[ctx.from].fechaElegida}  ${STATUS[ctx.from].rango} ${ctx.body} `
            }



            modificaBaseFueraDeZona(STATUS[ctx.from].nombre, 'FUERA DE ZONA', ctx.body)
            return flowDynamic('Disculpe, al ser fuera de CABA se eleva el caso a mudanzas. Se volverán a comunicar pronto. Muchas gracias')

        }
    })


const flowDomicilio = addKeyword(['mañana', 'tarde'])
    .addAnswer(['Bien,'], null, async (ctx, {
        flowDynamic
    }) => {

        STATUS[ctx.from] = {
                ...STATUS[ctx.from],
                nombre: await saveClientName(ctx.from)

            },

            STATUS[ctx.from] = {
                ...STATUS[ctx.from],
                domicilio: await getDomicilioByName(STATUS[ctx.from].nombre)

            }


        return flowDynamic(`Por favor confirmá el domicilio ${STATUS[ctx.from].domicilio} `)


    })
    .addAnswer([
            `Si le queda mas cómodo que pasemos por otro domicilio *dentro de CABA* o se mudó, puede *cambiar el domicilio*`
        ], {
            capture: true,
            buttons: [{
                    body: 'El domicilio es correcto'
                },
                {
                    body: 'Cambiar domicilio'
                },
                {
                    body: '❌ Cancelar solicitud'
                }
            ]
        },
        async (ctx, {
            flowDynamic,
        }) => {

            if (ctx.body.includes('Cancelar')) {
                await flowDynamic([{
                    body: '❌ *Su solicitud de cita ha sido cancelada* ❌',
                    buttons: [{
                        body: '⬅️ Volver al Inicio'
                    }]

                }, ])
            }
            if (ctx.body.includes('correcto')) {

                STATUS[ctx.from].visita = {
                    Nombre: STATUS[ctx.from].nombre,
                    Fecha: STATUS[ctx.from].fechaElegida,
                    RangoHorario: STATUS[ctx.from].rango,
                    Domicilio: STATUS[ctx.from].domicilio
                }




                await modificaBase(STATUS[ctx.from].visita)
                await addRowVisita(STATUS[ctx.from].visita)

                return flowDynamic(`Estupendo *${STATUS[ctx.from].nombre}*! te dejo el resumen de tu formulario
        
                \n- Fecha agendada: *${STATUS[ctx.from].fechaElegida}*
                \n- Rango horario seleccionado: *${STATUS[ctx.from].rango}*
                \n- Domicilio: *${STATUS[ctx.from].domicilio}*
                \n\n- Si encuentra algún problema no dude en iniciar nuevamente el asistente con la palabra "OK"*`)
            }

            // if (ctx.body == 'Cambiar domicilio') {
            //     // await flowDynamic([{
            //     //     body: '❌ *Su solicitud de cita ha sido cancelada* ❌',
            //     //     buttons: [{
            //     //         body: '⬅️ Volver al Inicio'
            //     //     }]

            //     // }, ])
            // }



        }, [flowCambioDomicilio])


const flowHorario = addKeyword(['1', '2', '3', '4', '5', '6'])
    .addAnswer([
            'Ahora necesito que selecciones un rango horario para que pasemos',
            'El turno *mañana* (9 a 13hs) o el turno *tarde* (13 a 18hs)',
            '*Los sábados puedo ofrecerte sólo el turno mañana*'
        ], {
            capture: true,
            buttons: [{
                    body: 'Turno Mañana'
                },
                {
                    body: 'Turno Tarde'
                },
                {
                    body: '❌ Cancelar solicitud'
                }
            ]
        },
        async (ctx, {
            flowDynamic,
            fallBack
        }) => {

            // STATUS[ctx.from] = {
            //         ...STATUS[ctx.from],
            //         nombre: await saveClientName(ctx.from)

            //     },

            //     STATUS[ctx.from] = {
            //         ...STATUS[ctx.from],
            //         domicilio: await getDomicilioByName(STATUS[ctx.from].nombre)

            //     },

            //     STATUS[ctx.from] = {
            //         ...STATUS[ctx.from],
            //         fechasActualizadas: await saveFechasExcel()
            //     }


            if (ctx.body == '❌ Cancelar solicitud') {
                await flowDynamic([{
                    body: '❌ *Su solicitud de cita ha sido cancelada*  ❌',
                    buttons: [{
                        body: '⬅️ Volver al Inicio'
                    }]

                }, ])

            } else {


                switch (ctx.body) {
                    case 'Turno Mañana':
                        STATUS[ctx.from] = {
                            ...STATUS[ctx.from],
                            rango: '9 a 13hs'
                        }
                        break;
                    case 'mañana':
                        STATUS[ctx.from] = {
                            ...STATUS[ctx.from],
                            rango: '9 a 13hs'
                        }
                        break;
                    case 'Turno Tarde':
                        STATUS[ctx.from] = {
                            ...STATUS[ctx.from],
                            rango: '13 a 18hs'
                        }


                        if (STATUS[ctx.from].fechaElegida.includes('sáb')) {
                            STATUS[ctx.from] = {
                                ...STATUS[ctx.from],
                                rango: '9 a 13hs'

                            }
                            return flowDynamic('Los sábados solo de mañana! si lo desea, puede cancelar la solicitud y seleccionar otro día y horario. De lo contrario, continúe con el siguiente paso')

                        } else {


                            return flowDynamic('Perfecto!')

                        }
                        break;

                    case 'tarde':
                        STATUS[ctx.from] = {
                            ...STATUS[ctx.from],
                            rango: '13 a 18hs'
                        }

                    default:
                        return fallBack(false, 'selecciona una de las opciones')
                        break;
                }



            }

        }, [flowDomicilio])



const flowFecha = addKeyword(['fecha', '1', 'reprogram', '4'])
    .addAnswer(['Consultando las fechas disponibles....'], null, async (ctx, {
        flowDynamic,
        provider
    }) => {

        STATUS[ctx.from] = {
                ...STATUS[ctx.from],
                nombre: await saveClientName(ctx.from)

            },

            STATUS[ctx.from] = {
                ...STATUS[ctx.from],
                domicilio: await getDomicilioByName(STATUS[ctx.from].nombre)

            },

            STATUS[ctx.from] = {
                ...STATUS[ctx.from],
                fechasActualizadas: await saveFechasExcel()
            }



        if (STATUS[ctx.from].nombre == 'Teléfono no existe en Base de datos') {

            flowDynamic([{
                body: 'Su teléfono no se encuentra en nuestra base de datos. Por favor seleccionar la opción de *asesor humano* o comuníquese del teléfono que recibió nuestros mensajes. Muchas gracias y disculpe por las molestias.',
                buttons: [{
                        body: '⬅️ Volver al inicio'
                    },
                    {
                        body: 'Hablar con un asesor humano'
                    }
                ]
            }])

        } else {

            const id = ctx.key.remoteJid

            const sections = [{
                    title: "FECHAS",
                    rows: [{
                            title: '1',
                            rowId: "option1",
                            description: STATUS[ctx.from].fechasActualizadas[0]
                        },
                        {
                            title: '2',
                            rowId: "option2",
                            description: STATUS[ctx.from].fechasActualizadas[1]
                        },
                        {
                            title: '3',
                            rowId: "option3",
                            description: STATUS[ctx.from].fechasActualizadas[2]
                        },
                        {
                            title: '4',
                            rowId: "option4",
                            description: STATUS[ctx.from].fechasActualizadas[3]
                        },
                        {
                            title: '5',
                            rowId: "option5",
                            description: STATUS[ctx.from].fechasActualizadas[4]
                        },
                        {
                            title: '6',
                            rowId: "option6",
                            description: STATUS[ctx.from].fechasActualizadas[5]
                        },

                    ]
                },

            ]

            const listMessage = {
                text: "Listado de fechas disponibles",
                buttonText: "Seleccione una fecha *AQUÍ*",
                sections
            }
            const abc = await provider.getInstance()
            await abc.sendMessage(id, listMessage)
            return
        }

    }, [])
    .addAnswer(['*↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*'], {
            capture: true,
            buttons: [{
                body: '❌ Cancelar solicitud ❌'
            }]
        },
        async (ctx, {
            flowDynamic,
            endFlow,
            fallBack,
            provider
        }) => {


            switch (ctx.body) {
                case 'option1':

                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[0]
                    }
                    break;
                case 'option2':
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[1]
                    }
                    break;
                case 'option3':
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[2]
                    }
                    break;
                case 'option4':
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[3]
                    }
                    break;
                case 'option5':
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[4]
                    }
                    break;
                case 'option6':
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[5]
                    }
                    break;
                case "❌ Cancelar solicitud ❌":
                    await flowDynamic([{
                        body: '❌ *Su solicitud de cita ha sido cancelada*  ❌',
                        buttons: [{
                            body: '⬅️ Volver al Inicio'
                        }]

                    }])
                    break;
                default:
                    return flowDynamic('Ok,')
                    break;
            }




        }, [flowHorario])



const flowPrincipal = addKeyword(['ok', 'inicio']).addAnswer(['Hola!'])
    .addAnswer(['Por favor elegir una de las siguientes opciones de la lista'], null, async (ctx, {
        provider,
    }) => {
        const id = ctx.key.remoteJid

        const sections = [{
                title: "COMPRAS",
                rows: [{
                        title: '*1*-Elegir *fecha* y hora de visita',
                        rowId: "option1",
                        description: "Elija esta opcion para reservar fecha y hora de visita"
                    },
                    {
                        title: '*2*-Hablar con un *asesor humano*',
                        rowId: "option2",
                        description: "Elija esta opcion para que se contacte con usted un asesor"
                    },
                    {
                        title: '*3*-*Consultar* visita previamente programada',
                        rowId: "option3",
                        description: "Elija esta opcion para consultar si tiene una visita programada con nosotros "
                    },
                    {
                        title: '*4*-Tengo una visita pactada y necesito *reprogramarla*',
                        rowId: "option4",
                        description: "Elija esta opcción para reprogramar una visita"
                    },
                    {
                        title: '*5*-Quiero presentar mi comprobante para que quede asentado',
                        rowId: "option5",
                        description: "Elija esta opccion para dejar asentado un comprobante de entrega"
                    },

                ]
            },


        ]

        const listMessage = {
            text: "Seleccione una opción",
            buttonText: "Abrir listado *AQUÍ*",
            sections
        }
        const abc = await provider.getInstance()

        await abc.sendMessage(id, listMessage)
        return
    }, [flowFecha, flowAsesor, flowConsulta, flowComprobante])




const flowConfirmación = addKeyword(['equipos retirados','equipo retirado']).addAnswer('Gracias por su tiempo!',null, async (ctx) => {
    STATUS[ctx.from] = {
        ...STATUS[ctx.from],
        nombre: await saveClientName(ctx.from)
    }

    visita = {
        Nombre: STATUS[ctx.from].nombre,        
    }

    modificaBaseResultado(visita, 'CONFIRMADO')

})


//FLOWS**\\


const flowChatGPT = addKeyword('hey silver')
    .addAnswer('Dígame', {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {
        var message = ctx.body;
        await CHATGPT.runCompletion(message).then(result => {
            return flowDynamic(result)
        });
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowChatGPT,flowConfirmación])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    }, {
        blackList: []
    })

    QRPortalWeb()
}

main()