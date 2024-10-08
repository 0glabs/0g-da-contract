import { task, types } from "hardhat/config";
import { BN254 } from "../../typechain-types/contracts/interface/IDASigners";
import { CONTRACTS, Factories, getTypedContract } from "../utils/utils";

task("precompile:params", "call precompile contract").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    console.log(await precompile.params());
});

task("precompile:epoch", "call precompile contract").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    console.log(await precompile.epochNumber());
});

task("precompile:quorum", "call precompile contract")
    .addParam("epoch", "epoch number", undefined, types.int, false)
    .setAction(async (args: { epoch: number }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        console.log(await precompile.quorumCount(args.epoch));
    });

task("precompile:test", "register signer").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    console.log(
        precompile.interface.encodeEventLog("SocketUpdated", [
            "0x9685C4EB29309820CDC62663CC6CC82F3D42E964",
            "0.0.0.0:1234",
        ])
    );
    console.log(
        precompile.interface.decodeEventLog(
            "SocketUpdated",
            "0x0000000000000000000000009685c4eb29309820cdc62663cc6cc82f3d42e9640000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000c302e302e302e303a313233340000000000000000000000000000000000000000",
            [
                "0x09617a966176a40f8f1410768b118506db0096484acd5811064fcc12038798de",
                "0x0000000000000000000000009685c4eb29309820cdc62663cc6cc82f3d42e964",
            ]
        )
    );
});

task("precompile:updatesocket", "update socket").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    const receipt = await (await precompile.updateSocket("0.0.0.0:2345")).wait();
    console.log(receipt);
    if (receipt) {
        console.log(receipt.logs);
    }
});

task("precompile:getsigner", "get signer")
    .addParam("addr", "signer addr", undefined, types.string, false)
    .setAction(async (args: { addr: string }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        const signer = await precompile.getSigner([args.addr]);
        console.log(signer[0]);
    });

task("entrance:submit", "upload").setAction(async (_, hre) => {
    const entrance = await getTypedContract(hre, CONTRACTS.DAEntrance);
    await (
        await entrance.submitOriginalData(["0x1111111111111111111111111111111111111111111111111111111111111111"])
    ).wait();
});

task("entrance:verify", "verify").setAction(async (_, hre) => {
    const entrance = await getTypedContract(hre, CONTRACTS.DAEntrance);
    console.log(
        await (
            await entrance.submitVerifiedCommitRoots(
                [
                    {
                        dataRoot: "0x1111111111111111111111111111111111111111111111111111111111111111",
                        epoch: 1,
                        quorumId: 0,
                        erasureCommitment: {
                            X: 1,
                            Y: 2,
                        },
                        quorumBitmap:
                            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                        aggPkG2: {
                            X: [
                                11559732032986387107991004021392285783925812861821192530917403151452391805634n,
                                10857046999023057135944570762232829481370756359578518086990519993285655852781n,
                            ],
                            Y: [
                                4082367875863433681332203403145435568316851327593401208105741076214120093531n,
                                8495653923123431417604973247489272438418190587263600148770280649306958101930n,
                            ],
                        },
                        signature: {
                            X: 20240815794158609083887909091588435888990175347573488336018201758301351634910n,
                            Y: 8696350876887103154678301478569986239034949365125721338095706277229682112359n,
                        },
                    },
                ],
                { gasLimit: 5000000 }
            )
        ).wait()
    );
});

task("precompile:issigner", "is signer").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    console.log(await precompile.isSigner(deployer));
});

task("precompile:registered", "is registered for next epoch").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const nextEpoch = (await precompile.epochNumber()) + 1n;
    console.log(await precompile.registeredEpoch(deployer, nextEpoch));
});

task("precompile:getquorum", "get quorum")
    .addParam("epoch", "epoch number", undefined, types.int, false)
    .addParam("quorum", "quorum id", undefined, types.int, false)
    .setAction(async (args: { epoch: number; quorum: number }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        const quorum = await precompile.getQuorum(args.epoch, args.quorum);
        console.log(quorum);
    });

task("precompile:getallquorum", "get quorum")
    .addParam("epoch", "epoch number", undefined, types.int, false)
    .setAction(async (args: { epoch: number }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        const cnt = await precompile.quorumCount(args.epoch);
        const res: { [key: number]: { [key: string]: number } } = {};
        for (let i = 0; i < cnt; ++i) {
            const quorum = await precompile.getQuorum(args.epoch, i);
            res[i] = {};
            for (const j of quorum) {
                if (!(j in res[i])) {
                    res[i][j] = 0;
                }
                ++res[i][j];
            }
        }
        console.log(res);
    });

task("precompile:getquorumrow", "get quorum row")
    .addParam("epoch", "epoch number", undefined, types.int, false)
    .addParam("quorum", "quorum id", undefined, types.int, false)
    .addParam("row", "row index", undefined, types.int, false)
    .setAction(async (args: { epoch: number; quorum: number; row: number }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        console.log(await precompile.getQuorumRow(args.epoch, args.quorum, args.row));
    });

task("precompile:getaggpkg1", "get aggregate public key g1")
    .addParam("epoch", "epoch number", undefined, types.int, false)
    .addParam("quorum", "quorum id", undefined, types.int, false)
    .setAction(async (args: { epoch: number; quorum: number }, hre) => {
        const precompile = Factories.IDASigners__factory.connect(
            "0x0000000000000000000000000000000000001000",
            (await hre.ethers.getSigners())[0]
        );
        console.log(
            await precompile.getAggPkG1(
                args.epoch,
                args.quorum,
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            )
        );
    });

task("precompile:register", "register signer").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const receipt = await (
        await precompile.registerSigner(
            {
                signer: deployer,
                socket: "0.0.0.0:1234",
                pkG1: {
                    X: 1n,
                    Y: 2n,
                },
                pkG2: {
                    X: [
                        10857046999023057135944570762232829481370756359578518086990519993285655852781n,
                        11559732032986387107991004021392285783925812861821192530917403151452391805634n,
                    ],
                    Y: [
                        8495653923123431417604973247489272438418190587263600148770280649306958101930n,
                        4082367875863433681332203403145435568316851327593401208105741076214120093531n,
                    ],
                },
            },
            {
                X: 17347288745752564851578145205408924577042674846071448492673629564958667746090n,
                Y: 21456041422468658262738002909407073439935597271458862589356790821116767485654n,
            }
        )
    ).wait();
    console.log(receipt);
    if (receipt) {
        console.log(receipt.logs);
    }
});

task("precompile:registerepoch", "register epoch").setAction(async (_, hre) => {
    const precompile = Factories.IDASigners__factory.connect(
        "0x0000000000000000000000000000000000001000",
        (await hre.ethers.getSigners())[0]
    );
    const nextEpoch = (await precompile.epochNumber()) + 1n;
    if (nextEpoch >= registerEpochSignatures.length) {
        throw new Error("no signature");
    }
    const signature: BN254.G1PointStruct = registerEpochSignatures[Number(nextEpoch)];
    const receipt = await (await precompile.registerNextEpoch(signature)).wait();
    console.log(receipt);
    if (receipt) {
        console.log(receipt.logs);
    }
});

const registerEpochSignatures: BN254.G1PointStruct[] = [
    {
        X: 2915499087226593647811100234840780831156431214899927433621205570337367771451n,
        Y: 7196150600102212777904270898145305353258289283038274471353408155703495027933n,
    },
    {
        X: 13283083124528531674735853832182424672122091139683454761857829308708073730285n,
        Y: 21773064143788270772276852950775943855438706734263253481317981346601766662828n,
    },
    {
        X: 5052501334519475629595488256630728851581597113978559636802042451748325187314n,
        Y: 19265221393366816923199039093645694673557828245248594175780990971115302344210n,
    },
    {
        X: 8313896899458628041200751511381867727965231893560026901427347595604559803617n,
        Y: 10382407701881829678575099085140432201080410848610873516084701217224283352813n,
    },
    {
        X: 2385830396344932634892862322964837086436125162109587314147594157654576322137n,
        Y: 14200360922313166580201168669664400753614527736031679324288061265853124365420n,
    },
    {
        X: 2377698142989258754449907149019834410826457887496651288397831033117432956929n,
        Y: 20759112154850652809533508567707393190237551005429099708316990593203002092912n,
    },
    {
        X: 1413747381007558246103402077009010066251562217622979008769103380308789399069n,
        Y: 9969620381699243496885323104876935828485049276687200848470466696766388943445n,
    },
    {
        X: 19003059937149275866344164969272699789609151117653674736497790116304535540311n,
        Y: 3779462611752390053077266915147322698288175528072495677154381333726883737295n,
    },
    {
        X: 19824872823115904453395190585338663633653272509670905469191401046608820118489n,
        Y: 10683780490116480737994184185576152418039251044586556774891595007918423518661n,
    },
    {
        X: 14265761490377560217053684336968516811213119491559288689635470289145995023775n,
        Y: 7430059674478279926639579082000326962545178946319442040476495721052671117522n,
    },
    {
        X: 16428464011298924656541277803226539205199431011882020546813262616114563027624n,
        Y: 9715338428940763369255308987733026260271999003705292760157002504017234709544n,
    },
    {
        X: 16381783708852401664432453756039154262193002042017080748654956923577981372595n,
        Y: 12141882361638418334268924749483602584406474910630917684139865557044358339962n,
    },
    {
        X: 12585508778190792469051676945498388330559974755911247626038577784402504150439n,
        Y: 6573046409684830210277939458964022295555898918479162293065142861487048146897n,
    },
    {
        X: 337365729945492633502143120642955153087195724514957635932789738472042533328n,
        Y: 844848505385319496400440180832509439011835066870605440023909854873784063862n,
    },
    {
        X: 4351722128260743523742139414299659746375076044583380823107223452533980715812n,
        Y: 19246968813914543700128673174111409954550389744393777993044319628987423861368n,
    },
    {
        X: 16276459343271714882926573404307659428341575775128251563536778407683061773749n,
        Y: 4914249579554275048948903369275974260027136813879635029356285437319976634037n,
    },
    {
        X: 17625982474466682558180157018038721239745296786414426098364461571064934066971n,
        Y: 13785590802506729161914425134817368416029436236080711709225928270995598902844n,
    },
    {
        X: 501004797803773880550241988428242340631300266969545883105090231339404454003n,
        Y: 872272822099251066548011159080201638017918390591777981889929820098751543845n,
    },
    {
        X: 19706302908437222401622119753908864466980782090237119416904743757290592127655n,
        Y: 4600679047940229205395378313445899056308095619465079024809211121011322094964n,
    },
    {
        X: 12292354533681045002244091119445568489263501573682142482392599295944141364994n,
        Y: 3143455450213401128773276515896556894214499505338124290122284134084834778617n,
    },
    {
        X: 7273171712888965733002297384632221748436275194881330952137720417905718603526n,
        Y: 5890784761994901640476962703538681903884128986814681877665597760807174149972n,
    },
    {
        X: 6305379907966814755284012731764891802759623087940067012307587601419596268985n,
        Y: 16518838511155871267925795556831072487718787063934842222603521616098702981448n,
    },
    {
        X: 15653211983003547972299686457699635413877785204190017198421008942894862150593n,
        Y: 14342652414091420023852308274117651089955211643679470337264977662573209713578n,
    },
    {
        X: 15309082027923399283801497370314703506357108272470329860791156730115835502778n,
        Y: 2790143300869812025417817881747946693966002360883294337465737347607151362152n,
    },
    {
        X: 9628891816112992235733888516459058628202673974270565250058913880151970429381n,
        Y: 5856302351920861283649537109073940746546399847309692333236292404251959369921n,
    },
    {
        X: 13699301629163184057565562418812884378868621027287181855433883092928387805329n,
        Y: 1880742956244777612790600166695712634473114242671939307405176438635264523385n,
    },
    {
        X: 6481650481111119625209021925264711991486166608392040975120592837619914087052n,
        Y: 20718663434134285006088987091644016745746766101479238394819216881050977632572n,
    },
    {
        X: 17936724805802742896378904805901210130748189855182988722614885643663806401091n,
        Y: 3590929204369097753086812892122505984434623638250405274380492900429805059661n,
    },
    {
        X: 4632858897898089487290198745849343453986696771812191454589348248915594368727n,
        Y: 4322629941593011178328758709542996076951069000609990494376028521599850234610n,
    },
    {
        X: 2362112482829815043840110463087456469739544523191139667444012264980030119248n,
        Y: 16982109081625276378123337175621626291862613200279203176922773849028231879969n,
    },
    {
        X: 20146142508750635297944267566172046212796207314742531416430128389946235104743n,
        Y: 11862400613921485382062338942489793058678314605667583123896913746390439902068n,
    },
    {
        X: 4701279154698840373808709119277955551330570446337101414471478249789755986025n,
        Y: 21426352231169458077902829111762421729182512497053041898065677817944430788056n,
    },
    {
        X: 13428456880632675456094371092167377510263743418719255657621898596428096614850n,
        Y: 8528506929666044833305352648915490320094688151869420426897717280656330521458n,
    },
    {
        X: 14118917628972498703679872921472616658207760767950503623702181764396835224762n,
        Y: 2337166812876615715141031938307343174254169978875926348361333118038730702461n,
    },
    {
        X: 18736789559449886014644418359396540794580210719703928261482006294665908801305n,
        Y: 8468100554994216713910491778924768382850181410601160259104682780347269598712n,
    },
    {
        X: 4752888332142093089365599822744323846358818678307558410986277352833380268502n,
        Y: 1778452111586846581166066108331304730251426303367743169221126971062136230626n,
    },
    {
        X: 5566084061206932035722826368159398959625878143829294002003359735486427853619n,
        Y: 12470498726851945230938823311037054070638862481419500118855354233125999333212n,
    },
    {
        X: 21249795510323896648349539081169695094441678624468883982200554870427806740313n,
        Y: 15532734126706336184263734839593552903510707545026131560667903737123297265429n,
    },
    {
        X: 20913064424656743527005974293109109924524249000818726986970651151079325543997n,
        Y: 8945776361813428109870128634184940497524938544361615722210540440875559147868n,
    },
    {
        X: 2990090077915704549391346899677116862895936430467675331705443928866104195239n,
        Y: 9085838351377764036953331920997053620215286827844810219198897311392994983992n,
    },
    {
        X: 6878700873959129111943873773459258806596888754008449115509361099244176177578n,
        Y: 5772180368749137031827162452703440541007851665342622665006576563291343875269n,
    },
    {
        X: 21438078147152272997194636536583774358146419897431882008809565173951587836249n,
        Y: 18703232899837504220844105807884005881955684919900787746632424290587529047482n,
    },
    {
        X: 7285441891374235290088090089367893129307744077374330229671212783368341373332n,
        Y: 7670553605858552555217586164612619324969442428440207904510034868759214699941n,
    },
    {
        X: 12765000758879459455386916423507471322354075675140574842287518999191351029720n,
        Y: 19071136609072574017716443223251925720653229722255668724356890475390479175650n,
    },
    {
        X: 2654833794154689429027940261807517654993243223537269309510086619379094474921n,
        Y: 17938541500829579876965754264829135829854435577278044406604592873625279314370n,
    },
    {
        X: 6181842049223271809064689150247994006966422082777574113998208015510933455211n,
        Y: 19588470429138675294406426143833030628806960487665910113685631801054460655845n,
    },
    {
        X: 1300334704381299883728560581652225005093811358014848742701656839815335153887n,
        Y: 14265716870891592839941398229036346401087210147634906619643808520053050405476n,
    },
    {
        X: 2814901843976848284262663198894915114016508548070147642749590293818512071577n,
        Y: 8503793092701908505796843406185487767881071241349004976875875027144708247891n,
    },
    {
        X: 19407806198069191315305122563856006308341330126275002155030466523886014899478n,
        Y: 10436882172581047218428570692225835906697886749948587246083499966523594512268n,
    },
    {
        X: 9829622720385957921335252256787540109614224360687762346847789136332690354590n,
        Y: 3403383242437339705740947955787057916539422759670539775831309971151315729444n,
    },
];
