require('dotenv').config()
const puppeteer = require("puppeteer");
const figlet = require("figlet");

process.stdout.write('\033c');
const banner = () => figlet('Alexia_0x1', (err, data) => {
    if (err) {
        process.stdout.write("Something went wrong...");
        process.stdout.write(err);
    }
    process.stdout.write(`\n${data}\n`);
    
});


(async (banner) => {
    banner();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-notifications"],
    });
    process.stdout.write("\x1b[1m[...] Iniciando a aplicação\n");
    
    const page = await browser.newPage();

    process.stdout.write("\x1b[1m[#] Logando na aplicação...\n");

    await page.goto("https://instagram.com/");

    await page.waitFor(3000);
    await page.focus('input[name="username"]');

    process.stdout.write(
        `\x1b[1;32m=>\x1b[0m\x1b[1m Usuario:\x1b[0;32m ${process.env.USER_IG}\n`
    );

    await page.keyboard.type(process.env.USER_IG);
    await page.focus('input[name="password"]');

    process.stdout.write(
        `\x1b[1;32m=>\x1b[0m\x1b[1m Senha:\x1b[0;32m ********\n`
    );

    await page.keyboard.type(process.env.PASS_IG);
    await page.click(".L3NKy");

    await page.waitFor(3000);
    await page.goto(`https://instagram.com/${process.env.USER_IG}`);

    process.stdout.write("\x1b[1;33m[+]\x1b[1m Iniciando coleta de usuarios...\n");

    await page.waitFor(3000);
    const numberProfiles = await page.evaluate(() => {
        let pathSeguidores = document.evaluate(
            "//a[contains(., 'seguidores')]",
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        );
        let btnSeguidores = pathSeguidores.iterateNext();
        let arrSeguidores = btnSeguidores.textContent.split(" ");
        btnSeguidores.click();
        return arrSeguidores[0];
    });
    await page.waitForSelector(".isgrP");
    let count = 0;
    var profiles = [];
    while (count < Number(numberProfiles)) {
        await page.evaluate(() =>
            document
                .querySelector(".isgrP")
                .scrollBy(
                    0,
                    document.querySelector(".isgrP").scrollHeight ||
                    document.querySelector(".isgrP").scrollHeight
                )
        );
        const nomes = await page.evaluate(() => {
            let profileNode = document.querySelectorAll(".FPmhX");
            let arrProfiles = [...profileNode];
            let arrProfileNames = arrProfiles.map((item) => item.textContent);
            return arrProfileNames;
        });
        profiles = nomes;
        count = nomes.length;
        process.stdout.write(`\x1b[36m =>\x1b[0m\x1b[1m Coletados:\x1b[0m ${count}/${numberProfiles}\n`);
        process.stdout.write("\033[F");
        process.stdout.write("\033[k");
        process.stdout.write("\r");
    }

    process.stdout.write(`\x1b[36m =>\x1b[0m\x1b[1m Coletados:\x1b[0m ${count}\n`);

    process.stdout.write(`\x1b[33m[!]\x1b[0m\x1b[1m Filtrando repetidos...\n`);

    let filter = profiles.filter(
        (name, index, self) => index === self.indexOf(name)
    );

    process.stdout.write(`\x1b[1;33m[!]\x1b[0m\x1b[1m Organizando lista de usuarios por nome...\n`);
    filter.sort();

    await page.goto(`https://www.instagram.com/p/${process.env.POST}/`);

    process.stdout.write(`\x1b[36m[#]\x1b[0m\x1b[1m Iniciando marcação de usuarios na publicação...\n`);

    let indexProfile = 0;
    for (let index = 0; index <= profiles.length; index++) {
        await page.click("textarea");
        if (!filter[indexProfile]) break;

        await page.keyboard.type(`@${filter[indexProfile]} `, { delay: 30 });

        process.stdout.write(`\x1b[36m =>\x1b[0m\x1b[1m Marcando:\x1b[0;37m ${filter[indexProfile]}`);

        await page.waitFor(1000);
        indexProfile++;

        await page.keyboard.type(`@${filter[indexProfile]}  - `, { delay: 30 });

        process.stdout.write(` e ${filter[indexProfile]}\n`);

        await page.waitFor(1000);
        indexProfile++;

        const [btn] = await page.$x("//button[contains(., 'Publicar')]");
        await btn.click();
        await page.waitFor(5000);

        process.stdout.write("\033[F");
        process.stdout.write("\033[k");
        process.stdout.write("\r");
    }
    process.stdout.write('\x1b[32mOperação terminada.');
})(banner);
