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
    .addAnswer('Escriba por favor calle, número y localidad (CABA o CAPITAL si corresponde)', {
        capture: true
    }, async (ctx, {
        flowDynamic
    }) => {


        if (ctx.body.toLowerCase().includes('caba') || ctx.body.toLowerCase().includes('capital') || ctx.body.toLowerCase().includes('belgrano') || ctx.body.toLowerCase().includes('palermo')) {


            STATUS[ctx.from].visita = {
                Nombre: STATUS[ctx.from].nombre,
                Fecha: STATUS[ctx.from].fechaElegida,
                RangoHorario: STATUS[ctx.from].rango,
                Domicilio: ctx.body,
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

                        if (STATUS[ctx.from].fechaElegida.includes('sáb')) {
                            STATUS[ctx.from] = {
                                ...STATUS[ctx.from],
                                rango: '9 a 13hs'
                            }

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


            if (ctx) return flowDynamic([{
                    body: '*1*-' + STATUS[ctx.from].fechasActualizadas[0],
                },
                {
                    body: '*2*-' + STATUS[ctx.from].fechasActualizadas[1]
                },
                {
                    body: '*3*-' + STATUS[ctx.from].fechasActualizadas[2]
                },
                {
                    body: '*4*-' + STATUS[ctx.from].fechasActualizadas[3]
                },
                {
                    body: '*5*-' + STATUS[ctx.from].fechasActualizadas[4]
                },
                {
                    body: '*6*-' + STATUS[ctx.from].fechasActualizadas[5]
                }

            ])





        }
    })
    .addAnswer([
            'Estas son las opciones que tengo para ofrecerte. Recordá responder con *1*, *2*, *3*, *4*, *5* o *6*'
        ], {
            capture: true,
            buttons: [{
                body: '❌ Cancelar solicitud ❌'
            }]
        },
        async (ctx, {
            flowDynamic,
            endFlow,
            fallBack
        }) => {

            switch (ctx.body) {
                case "1":

                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[0]
                    }
                    break;
                case "2":
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[1]
                    }
                    break;
                case "3":
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[2]
                    }
                    break;
                case "4":
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[3]
                    }
                    break;
                case "5":
                    STATUS[ctx.from] = {
                        ...STATUS[ctx.from],
                        fechaElegida: STATUS[ctx.from].fechasActualizadas[4]
                    }
                    break;
                case "6":
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
    const adapterFlow = createFlow([flowPrincipal])
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