const {
    createBot,
    createProvider,
    createFlow,
    addKeyword,
} = require('@bot-whatsapp/bot')

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
let nombre
let mensaje
let rango
let domicilio
let respuestaConsulta
let visita
let fechaElegida
let fechasActualizadas
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

//Agrega la celda del rango horario en el excel
const addCellRangoHorario = async (nombre, rango) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet4 = doc.sheetsByIndex[4];

    // Get all the rows
    let rows = await sheet4.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.Nombre == nombre) {
            row.RangoHorario = rango
            await rows[index].save(); // save updates
        }
    };
};

//Agrega la celda del domicilio en el excel
const addCellDomicilio = async (nombre, texto) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet4 = doc.sheetsByIndex[4];

    // Get all the rows
    let rows = await sheet4.getRows();

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row.Nombre == nombre) {
            row.Domicilio = texto
            await rows[index].save(); // save updates
        }
    };
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

//Agrega un registro en la pestaña de Fuera de Zona
const addRowFueraDeZona = async (row) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();


    // Index of the sheet
    let sheet5 = doc.sheetsByIndex[5];

    await sheet5.addRow(row);

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
            row.RESULTADO = 'CONCRETADO'
            await rows[index].save(); // save updates
        }
    };


};

//Agrega un registro parcial en la pestaña de visitas pactadas
const addRowCitaFecha = async (row) => {

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

//Elimina Fila
const deleteRow = async (columna, valor) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet4 = doc.sheetsByIndex[4];

    let rows = await sheet4.getRows();

    for (let index = 0; index < rows.length; index++) {

        const row = rows[index];

        if (row[columna] === valor) {

            await rows[index].delete();
            // await rows[index].save();
            break;
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

//**FLOWS

const flowComprobante = addKeyword(['entregue', '5', 'comprobante'])
    .addAnswer(['Perfecto! Por favor faciliteme una foto clara del comprobante y escriba Enviado.'], {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {

        mensaje = ctx.body
        nombre = await saveClientName(ctx.from);

        visita = {
            Nombre: nombre,
            Teléfono: ctx.from,
            Mensaje: 'Comprobante presentado'
        }
        addRowAsesor(visita)
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
            return endFlow()
        })

const flowGracias = addKeyword('finalizado')
    .addAnswer([
        'Genial! Queda agendada la visita. Muchas gracias por su tiempo'
    ], {
        buttons: [{
            body: '⬅️ Volver al Inicio'
        }]
    })

const flowCambioDomicilio = addKeyword('Cambiar')
    .addAnswer('Escriba por favor calle, número y localidad', {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {


        if (ctx.body.toLowerCase().includes('caba')) {


            visita = {
                Nombre: nombre,
                Fecha: fechaElegida,
                RangoHorario: rango,
                Domicilio: ctx.body
            }
            await modificaBase(visita)

            await addRowVisita(visita)

            return flowDynamic('La visita se ha agendado correctamente.')

        } else {

            visita = {
                Nombre: nombre,
                Teléfono: ctx.from,
                Cita_Obs: `${fechaElegida}  ${rango} ${ctx.body} `
            }

            await addRowFueraDeZona(visita)
            return flowDynamic('Disculpe, al ser fuera de CABA se eleva el caso a mudanzas. Se volverán a comunicar pronto. Muchas gracias')

        }
    })


const flowDomicilio = addKeyword(['mañana', 'tarde'])
    .addAnswer(['Bien,'], null, async (ctx, {
        flowDynamic
    }) => {

        nombre = await saveClientName(ctx.from)
        domicilio = await getDomicilioByName(nombre)

        return flowDynamic(`Por favor confirmá el domicilio ${domicilio} `)


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

                visita = {
                    Nombre: nombre,
                    Fecha: fechaElegida,
                    RangoHorario: rango,
                    Domicilio: domicilio
                }

                await modificaBase(visita)
                await addRowVisita(visita)

                return flowDynamic('La visita se ha agendado correctamente. Para consultarla en cualquier momento escriba consultar')
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
                        rango = '9 a 13hs'
                        break;
                    case 'mañana':
                        rango = '9 a 13hs'
                        break;
                    case 'Turno Tarde':
                        rango = '13 a 18hs'

                        if (fechaElegida.includes('sáb')) {

                            rango = '9 a 13hs'
                            return flowDynamic('Los sábados solo de mañana! si lo desea, puede cancelar la solicitud y seleccionar otro día y horario. De lo contrario, continúe con el siguiente paso')

                        } else {


                            return flowDynamic('Perfecto!')

                        }
                        break;

                    case 'tarde':
                        rango = '13 a 18hs'

                        if (fechaElegida.includes('sáb')) {

                            rango = '9 a 13hs'
                            return flowDynamic('Los sábados solo de mañana! si lo desea, puede cancelar la solicitud y seleccionar otro día y horario. De lo contrario, continúe con el siguiente paso')

                        } else {


                            return flowDynamic('Perfecto!')

                        }
                        default:
                            return fallBack(false, 'selecciona una de las opciones')
                            break;
                }



            }

        }, [flowDomicilio])



const flowFecha = addKeyword(['fecha', '1', 'reprogram', '4'])
    .addAnswer(['Consultando las fechas disponibles....'], null, async (ctx, { 
        flowDynamic
    }) => {

        nombre = await saveClientName(ctx.from)
        domicilio = await getDomicilioByName(nombre)
        fechasActualizadas = await saveFechasExcel()

        if (nombre == 'Teléfono no existe en Base de datos') {

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


            if (ctx) return flowDynamic([{
                    body: '*1*-' + fechasActualizadas[0],
                    // buttons: [{body:'*1*'}]
                },
                {
                    body: '*2*-' + fechasActualizadas[1]
                },
                {
                    body: '*3*-' + fechasActualizadas[2]
                },
                {
                    body: '*4*-' + fechasActualizadas[3]
                },
                {
                    body: '*5*-' + fechasActualizadas[4]
                },
                {
                    body: '*6*-' + fechasActualizadas[5]
                }

            ])


            


        }
    })
    .addAnswer([
            'Estas son las opciones que tengo para ofrecerte. Recordá responder con *1*, *2*, *3*, *4*, *5* o *6*'
        ], {
            capture: true,
            buttons: [{
                body: '❌ Cancelar solicitud'
            }]
        },
        async (ctx, {
            flowDynamic,
            endFlow,
            fallBack
        }) => {

            if (ctx.body == '❌ Cancelar solicitud') {
                await flowDynamic([{
                    body: '❌ *Su solicitud de cita ha sido cancelada*  ❌',
                    buttons: [{
                        body: '⬅️ Volver al Inicio'
                    }]

                }])
            }

            switch (ctx.body) {
                case "1":
                    fechaElegida = fechasActualizadas[0]
                    break;
                case "2":
                    fechaElegida = fechasActualizadas[1]
                    break;
                case "3":
                    fechaElegida = fechasActualizadas[2]
                    break;
                case "4":
                    fechaElegida = fechasActualizadas[3]
                    break;
                case "5":
                    fechaElegida = fechasActualizadas[4]
                    break;
                case "6":
                    fechaElegida = fechasActualizadas[5]
                    break;
                default:
                    return fallBack(false, 'Recordá responder con 1, 2, 3, 4, 5 o 6 ')
                    break;
            }

        }, [flowHorario])



const flowPrincipal = addKeyword(['alo', 'buen', 'hola', 'ok', 'inicio']).addAnswer(['Hola!'])
    .addAnswer([
        'Por favor elegir una de las siguientes opciones con *1*, *2*, *3*, *4* o *5*'
    ])
    .addAnswer([
            '*1*-Elegir *fecha* y hora de visita',
            '*2*-Hablar con un *asesor humano*',
            '*3*-*Consultar* visita previamente programada',
            '*4*-Tengo una visita pactada y necesito *reprogramarla*',
            '*5*-Quiero presentar mi comprobante para que quede asentado'


        ],
        null,
        null,
        [flowFecha, flowAsesor, flowConsulta, flowComprobante])


//FLOWS**\\

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowGracias, flowConsulta, flowAsesor])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()