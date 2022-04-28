const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let accounts;
let inbox;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    // создаем новый екземпляр контракта с передаем в него наш
    // интерфейс а на гачи бас заливаем наш байт код
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode,
            arguments: ['Hi there!']
        }).send({
            from: accounts[0],
            gas: '1000000'
        });
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('message == "Hi there!"', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hi there!');
    })

    it('can change the message', async () => {
        // в тесте нам нужно указать кто будет платить за транзакцию
        // обновление данных в нашем контракте send метод который
        // отправляет данные в наш контракт и как в своих описаниях
        // далее нам нужно подождать promise ответ обновилось или нет
        // оно может не обновиться по той причине что у пользователя закончился gas
        // что такое gas можно прочитать во втором докладе
        await inbox.methods.setMessage('bye').send({ from: accounts[0] })
        const message = await inbox.methods.message().call();
        assert.equal(message, 'bye')
    });
});
