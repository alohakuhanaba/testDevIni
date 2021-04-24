// load the things needed
const express = require('express')
const routes = express.Router();
const axios = require('axios');
const qs = require('qs');
const query = require('./database/index');
const parser = require('body-parser');
const urlEncParser = parser.urlencoded({extended: false});

// use res.render to load up an ejs view files

routes.get('/', (req,res) => {
    res.render("register");
})

routes.post('/register', urlEncParser, async (req,res) => {
    const { nome, sobrenome, email } = req.body;

    const data = qs.stringify({
        nome: nome,
        sobrenome: sobrenome,
        email: email
    });

    const response = await axios.post(
        'http://138.68.29.250:8082',
        data,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
    );

    const serverResp = response.data;

    const splittedResp = serverResp.split('#');

    const serverData = {
        nome: splittedResp[1],
        sobrenome: splittedResp[3],
        email: splittedResp[5]
    };

    await query(`INSERT INTO tbs_nome (nome, cod) VALUES ('${nome}', '${serverData.nome}');
                INSERT INTO tbs_sobrenome (sobrenome, cod) VALUES ('${sobrenome}', '${serverData.sobrenome}');
                INSERT INTO tbs_email (email, cod) VALUES ('${email}', '${serverData.email}');`,
        (err, rows) => {

        if(!!err) console.log(err);
    });

    await query(`SELECT * FROM tbs_cod_nome WHERE cod=${serverData.nome};
        SELECT * FROM tbs_cod_sobrenome WHERE cod=${serverData.sobrenome};
        SELECT * FROM tbs_cod_email WHERE cod=${serverData.email};`,
        async (err, {rowCount, rows}) => {

            if(err) console.log(err);

            const data = rows;

            let total = 0;

            data.forEach(element => {
                total += parseInt(element[1].value) + parseInt(element[2].value)
            });

            await query(`SELECT * FROM tbs_animais WHERE total=${total};
            SELECT * FROM tbs_paises WHERE total=${total};
            SELECT cores.cor, cores_ex.cor, cores.total FROM tbs_cores AS cores LEFT JOIN tbs_cores_excluidas AS cores_ex ON cores.cor = cores_ex.cor WHERE cores_ex.cor is null AND cores.total=${total};
            `,
                (err, {rowCount, rows}) => {

                if(err) console.log(err);

                const arr = []

                // validate values
                rows.forEach(element => {
                    if(element[1]['value']) {
                        arr.push(element[1]['value']);
                    }
                    if(isNaN(element[0]['value'])) {
                        arr.push(element[0]['value'])
                    }
                });

                // return values
                res.render('user', {nome: nome, sobrenome: sobrenome, email: email, object: arr})

            });
    });
})

module.exports = routes;