const TRIZE_MOTORISTAS = [
    // FIORINO
    { tipo: "FIORINO", transportador: "22926", lcont: "926", motorista: "ALICIO BATISTA PAIVA", proprietario: "ALICIO BATISTA PAIVA", nMotorista: "926", placa: "AOI-2C26", cidade: "LONDRINA", cpf: "558.893.019-34" },
    { tipo: "FIORINO", transportador: "5893", lcont: "403", motorista: "ALISSON LUIZ LOUCAO", proprietario: "ALISSON LUIZ LOUCAO 55.113.383", nMotorista: "1475", placa: "AQJ9H16", cidade: "LONDRINA", cpf: "066.427.129-43" },
    { tipo: "FIORINO", transportador: "22682", lcont: "682", motorista: "ANISIO DA SILVA", proprietario: "ANISIO DA SILVA", nMotorista: "1319", placa: "EJE1A71", cidade: "ROLÂNDIA", cpf: "364.265.809-10" },
    { tipo: "FIORINO", transportador: "6512", lcont: "186", motorista: "CRISTIANO DE SOUZA LIMA", proprietario: "CRISTIANO DE SOUZA LIMA", nMotorista: "1317", placa: "AYZ5C79", cidade: "ARAPONGAS", cpf: "313.304.038-35" },
    { tipo: "FIORINO", transportador: "182", lcont: "182", motorista: "ERLI BERNARDINO", proprietario: "59531845 ERLI BERNARDINO", nMotorista: "182", placa: "SEO0J71", cidade: "CAMBÉ", cpf: "589.207.739-04" },
    { tipo: "FIORINO", transportador: "22910", lcont: "950", motorista: "GENIVAL LINO DE ALMEIDA", proprietario: "61051.687 GENIVAL LINO DE ALMEIDA", nMotorista: "1326", placa: "HMC5H95", cidade: "LONDRINA", cpf: "300.770.799-49" },
    { tipo: "FIORINO", transportador: "4415", lcont: "140", motorista: "HENRIQUE DA SILVEIRA TAVARES", proprietario: "HENRIQUE DA SILVEIRA TAVARES 07682386924", nMotorista: "1410", placa: "MLV5G12", cidade: "ROLÂNDIA", cpf: "076.823.869-24" },
    { tipo: "FIORINO", transportador: "5562", lcont: "818", motorista: "JOAO PAULO MACHADO BARBOSA", proprietario: "JOAO PAULO MACHADO BARBOSA", nMotorista: "1249", placa: "FNZ2J53", cidade: "LONDRINA", cpf: "045.677.969-85" },
    { tipo: "FIORINO", transportador: "5859", lcont: "944", motorista: "JOSE ANGELO DOS SANTOS", proprietario: "34.314.982 JOSE ANGELO DOS SANTOS", nMotorista: "1451", placa: "AQB0H89", cidade: "LONDRINA", cpf: "540.308.709-53" },
    { tipo: "FIORINO", transportador: "5590", lcont: "428", motorista: "LEONARDO OLIVEIRA RESENDE", proprietario: "DANIELE IACONO WENTZ DE RESENDE", nMotorista: "1428", placa: "BDN0A67", cidade: "ROLÂNDIA", cpf: "055.425.519-71" },
    { tipo: "FIORINO", transportador: "1358", lcont: "893", motorista: "MAIKON MICHEL RODRIGUES", proprietario: "KELLY APARECIDA DA SILVA RODRIGUES 0546876", nMotorista: "1356", placa: "AQC4D55", cidade: "IBIPORÃ", cpf: "044.886.619-63" },
    { tipo: "FIORINO", transportador: "5522", lcont: "376", motorista: "MATHEUS GABRIEL DE SOUZA ME", proprietario: "CLAUDIMEIRE CRISTINA DE SOUZA 02187967905", nMotorista: "1496", placa: "ARU8B29", cidade: "ROLÂNDIA", cpf: "106.686.459-46" },
    { tipo: "FIORINO", transportador: "5521", lcont: "885", motorista: "ODAIR JOSE DE CARVALHO", proprietario: "ODAIR JOSE DE CARVALHO 01855582910", nMotorista: "1374", placa: "DRR2C83", cidade: "CAMBÉ", cpf: "018.555.829-10" },
    { tipo: "FIORINO", transportador: "5068", lcont: "421", motorista: "OSVALDO FERRAZ DE SOUZA", proprietario: "IGOR DA SILVA DE JESUS", nMotorista: "1541", placa: "AJR3E53", cidade: "APUCARANA", cpf: "744.387.009-49" },
    { tipo: "FIORINO", transportador: "736", lcont: "736", motorista: "OSWALDO SADAHALU KOBATA", proprietario: "OSWALDO SADAHALU KOBATA", nMotorista: "655", placa: "QDN7G63", cidade: "LONDRINA", cpf: "165.371.309-72" },
    { tipo: "FIORINO", transportador: "6314", lcont: "102", motorista: "ROGERIO ANGELO CARDOSO JR", proprietario: "ROGERIO ANGELO CARDOSO", nMotorista: "", placa: "AVS9C58", cidade: "LONDRINA", cpf: "082.473.879-99" },
    { tipo: "FIORINO", transportador: "1363", lcont: "384", motorista: "RONALDO VALENTIN DAMACENO", proprietario: "JOSE ALVES DAMACENO 06338135915", nMotorista: "1384", placa: "ANC4J53", cidade: "CAMBÉ", cpf: "908.410.509-53" },
    { tipo: "FIORINO", transportador: "2359", lcont: "245", motorista: "SANDERSON HERCULANO DA COS", proprietario: "SANDERSON HERCULANO DA COSTA", nMotorista: "1365", placa: "AYN7G19", cidade: "CAMBÉ", cpf: "071.177.709-88" },

    // VAN
    { tipo: "VAN", transportador: "5567", lcont: "577", motorista: "ABRAAO MESSIAS POLICANTI", proprietario: "ABRAAO MESSIAS POLICANTI", nMotorista: "1420", placa: "AGX3I88", cidade: "ARAPONGAS", cpf: "083.305.019-22" },
    { tipo: "VAN", transportador: "5563", lcont: "741", motorista: "AGENOR DIAS", proprietario: "DEJANIRA PEREIRA DOS SANTOS DIAS", nMotorista: "675", placa: "MBF8J91", cidade: "LONDRINA", cpf: "392.911.979-04" },
    { tipo: "VAN", transportador: "22562", lcont: "562", motorista: "AIRTON DIVINO DA SILVA", proprietario: "ROBERTO LUIZ DE OLIVEIRA", nMotorista: "1562", placa: "UBA7I66", cidade: "LONDRINA", cpf: "362.024.449-91" },
    { tipo: "VAN", transportador: "22923", lcont: "781", motorista: "ALAIN BASSI DO NASCIMENTO", proprietario: "ALAIN BASSI DO NASCIMENTO", nMotorista: "982", placa: "EPQ7554", cidade: "LONDRINA", cpf: "730.922.749-20" },
    { tipo: "VAN", transportador: "22873", lcont: "398", motorista: "ALCIDES DOLEMBA", proprietario: "CRISTIANO DOLEMBA", nMotorista: "1313", placa: "AXY0G30", cidade: "CAMBÉ", cpf: "395.640.029-15" },
    { tipo: "VAN", transportador: "5602", lcont: "925", motorista: "ALEX SANDRO OLIVEIRA DE ALMI", proprietario: "JOAO LUIS VICENTE", nMotorista: "1522", placa: "ATB2F08", cidade: "ROLÂNDIA", cpf: "970.942.930-20" },
    { tipo: "VAN", transportador: "5306", lcont: "906", motorista: "ANDRE FONTANELA", proprietario: "ANDRE FONTANELA", nMotorista: "1537", placa: "AQJ0B22", cidade: "CAMBÉ", cpf: "032.382.629-63" },
    { tipo: "VAN", transportador: "5524", lcont: "411", motorista: "CELSO ZAMBOLIN", proprietario: "CELSO ZAMBOLIN", nMotorista: "1401", placa: "BAE4F18", cidade: "LONDRINA", cpf: "103.831.198-55" },
    { tipo: "VAN", transportador: "22831", lcont: "831", motorista: "CICERO RODRIGUES", proprietario: "CICERO RODRIGUES", nMotorista: "1247", placa: "ASU6C30", cidade: "LONDRINA", cpf: "561.397.059-91" },
    { tipo: "VAN", transportador: "22873", lcont: "336", motorista: "CRISTIANO DOLEMBA", proprietario: "CRISTIANO DOLEMBA", nMotorista: "1338", placa: "FKT2F73", cidade: "CAMBÉ", cpf: "062.207.419-94" },
    { tipo: "VAN", transportador: "1356", lcont: "91", motorista: "EDERSON DA SILVA", proprietario: "EDERSON DA SILVA 05745277963", nMotorista: "1358", placa: "AWA6D28", cidade: "IBIPORÃ", cpf: "057.452.779-63" },
    { tipo: "VAN", transportador: "6500", lcont: "134", motorista: "ELVIO APARECIDO KONOPKA", proprietario: "ELVIO APARECIDO KONOPKA", nMotorista: "1547", placa: "BDX4A92", cidade: "LONDRINA", cpf: "036.337.619-42" },
    { tipo: "VAN", transportador: "5523", lcont: "", motorista: "FABIO DA SILVA OLIVEIRA", proprietario: "FABIO DA SILVA OLIVEIRA", nMotorista: "1381", placa: "JAY7B15", cidade: "LONDRINA", cpf: "061.525.559-06" },
    { tipo: "VAN", transportador: "5055", lcont: "418", motorista: "GERALDO TEODORO", proprietario: "49.927.236 GERALDO TEODORO", nMotorista: "1418", placa: "ATD3G45", cidade: "ARAPONGAS", cpf: "020.284.953-73" },
    { tipo: "VAN", transportador: "1364", lcont: "431", motorista: "HELIO DOS SANTOS ABREU", proprietario: "HELIO DOS SANTOS ABREU", nMotorista: "1431", placa: "EKH0I50", cidade: "ARAPONGAS", cpf: "325.678.809-25" },
    { tipo: "VAN", transportador: "5530", lcont: "395", motorista: "IVAN BORTOLOSSI DE SOUZA", proprietario: "IVAN BORTOLOSSI DE SOUZA 03482929963", nMotorista: "1395", placa: "TAY2F85", cidade: "LONDRINA", cpf: "034.829.299-63" },
    { tipo: "VAN", transportador: "5904", lcont: "904", motorista: "JACKSON LUIZ MACHADO DE SAN", proprietario: "JACKSON LUIZ MACHADO DE SANTANA", nMotorista: "1536", placa: "ANB0G77", cidade: "LONDRINA", cpf: "024.708.449-24" },
    { tipo: "VAN", transportador: "22840", lcont: "840", motorista: "JEDIEL TEODORO DA SILVA", proprietario: "JEDIEL TEODORO DA SILVA", nMotorista: "1282", placa: "ABY2B31", cidade: "LONDRINA", cpf: "054.054.619-20" },
    { tipo: "VAN", transportador: "5601", lcont: "150", motorista: "JESAEL CARNEIRO DE MELO", proprietario: "JESAEL CARNEIRO DE MELO 02829876903", nMotorista: "1444", placa: "ATA0C31", cidade: "LONDRINA", cpf: "028.298.769-03" },
    { tipo: "VAN", transportador: "6379", lcont: "715", motorista: "JOAO MANOEL DE SOUZA SEVERO", proprietario: "JOAO MANOEL DE SOUZA SEVERO", nMotorista: "1375", placa: "BEB7H99", cidade: "CAMBÉ", cpf: "102.893.449-13" },
    { tipo: "VAN", transportador: "1902", lcont: "900", motorista: "JORGE ARMANDO RIVERA LOPES", proprietario: "JORGE ARMANDO RIVERA LOPES", nMotorista: "1499", placa: "FWG7H74", cidade: "LONDRINA", cpf: "236.076.398-92" },
    { tipo: "VAN", transportador: "5722", lcont: "112", motorista: "JOSEMAR DO NASCIMENTO", proprietario: "JOSEMAR DO NASCIMENTO", nMotorista: "1408", placa: "EWJ0B95", cidade: "APUCARANA", cpf: "711.374.089-87" },
    { tipo: "VAN", transportador: "22519", lcont: "519", motorista: "JULIANA JAQUELINE DOS SANTOS", proprietario: "PAULO VICENTE DOS SANTOS", nMotorista: "1559", placa: "FTG0C64", cidade: "APUCARANA", cpf: "076.470.649-75" },
    { tipo: "VAN", transportador: "5523", lcont: "381", motorista: "LUIS RAFAEL VALERIO", proprietario: "FABIO DA SILVA OLIVEIRA 06152555906", nMotorista: "1538", placa: "PVQ3A82", cidade: "LONDRINA", cpf: "052.872.309-07" },
    { tipo: "VAN", transportador: "5307", lcont: "860", motorista: "MAICON HENRIQUE DIAS", proprietario: "DALVA DE SOUZA SILVEIRA", nMotorista: "1530", placa: "DAH4G00", cidade: "LONDRINA", cpf: "065.420.789-59" },
    { tipo: "VAN", transportador: "181", lcont: "181", motorista: "MARCELO PEREIRA ALVES", proprietario: "MARCELO PEREIRA ALVES", nMotorista: "1126", placa: "APN0081", cidade: "LONDRINA", cpf: "812.985.019-20" },
    { tipo: "VAN", transportador: "4606", lcont: "406", motorista: "MARCO ANTONIO CAPATO", proprietario: "MARCO ANTONIO CAPATO", nMotorista: "1549", placa: "INK5C91", cidade: "LONDRINA", cpf: "911.162.369-15" },
    { tipo: "VAN", transportador: "5321", lcont: "404", motorista: "MARCOS APARECIDO IRMER", proprietario: "C P CATIONI LTDA", nMotorista: "1404", placa: "AOF0I81", cidade: "ROLÂNDIA", cpf: "339.151.109-06" },
    { tipo: "VAN", transportador: "5309", lcont: "919", motorista: "MARCOS AURELIO DE SOUZA", proprietario: "MARCOS AURELIO DE SOUZA", nMotorista: "1546", placa: "QFK7I30", cidade: "LONDRINA", cpf: "031.970.649-41" },
    { tipo: "VAN", transportador: "22560", lcont: "560", motorista: "MARCOS HENRIQUE MARTINS", proprietario: "MARCOS HENRIQUE MARTINS", nMotorista: "1560", placa: "AVL1G51", cidade: "ROLÂNDIA", cpf: "058.803.058-93" },
    { tipo: "VAN", transportador: "737", lcont: "737", motorista: "MARCOS ROBERTO DE OLIVEIRA", proprietario: "MARCOS ROBERTO DE OLIVEIRA", nMotorista: "660", placa: "SEL8D06", cidade: "ROLÂNDIA", cpf: "025.000.189-62" },
    { tipo: "VAN", transportador: "22802", lcont: "802", motorista: "MARCOS ROBERTO DIAS", proprietario: "MARCOS ROBERTO DIAS", nMotorista: "1075", placa: "HSD4543", cidade: "ROLÂNDIA", cpf: "624.534.509-53" },
    { tipo: "VAN", transportador: "22784", lcont: "784", motorista: "PAULO VICENTE DOS SANTOS", proprietario: "PAULO VICENTE DOS SANTOS", nMotorista: "1057", placa: "ALT5H85", cidade: "APUCARANA", cpf: "471.975.959-91" },
    { tipo: "VAN", transportador: "5857", lcont: "444", motorista: "PETERSON VINICIUS DOS SANTOS", proprietario: "PETERSON VINICIUS DOS SANTOS CARDOSO", nMotorista: "1484", placa: "BBV9E74", cidade: "LONDRINA", cpf: "073.015.049-69" },
    { tipo: "VAN", transportador: "22871", lcont: "372", motorista: "REINALDO APARECIDO PONTES", proprietario: "REINALDO APARECIDO PONTES", nMotorista: "1312", placa: "MQS9C71", cidade: "ROLÂNDIA", cpf: "399.780.809-53" },
    { tipo: "VAN", transportador: "5524", lcont: "410", motorista: "RICARDO MENDONCA RAIMUNDO", proprietario: "CELSO ZAMBOLIN", nMotorista: "1561", placa: "EPU9C68", cidade: "LONDRINA", cpf: "029.635.469-47" },
    { tipo: "VAN", transportador: "22558", lcont: "558", motorista: "ROMULO DA SILVA VAZ", proprietario: "ROMULO DA SILVA VAZ", nMotorista: "1558", placa: "BCX9E85", cidade: "ARAPONGAS", cpf: "372.074.638-04" },
    { tipo: "VAN", transportador: "22872", lcont: "872", motorista: "TIAGO GALETI", proprietario: "ALCIDES DOLEMBA", nMotorista: "1501", placa: "AXN0F66", cidade: "CAMBÉ", cpf: "062.460.809-36" },
    { tipo: "VAN", transportador: "22866", lcont: "402", motorista: "VALDEILDO DE SOUZA", proprietario: "VALDEILDO DE SOUZA", nMotorista: "1402", placa: "MJB2C47", cidade: "LONDRINA", cpf: "698.444.963-34" },
    { tipo: "VAN", transportador: "6379", lcont: "", motorista: "VALDIR SEVERO APARECIDO", proprietario: "JOAO MANOEL DE SOUZA SEVERO", nMotorista: "1554", placa: "DQR0B21", cidade: "CAMBÉ", cpf: "582.197.739-87" },
    { tipo: "VAN", transportador: "5557", lcont: "485", motorista: "WESLEY DAYRTON DO NASCIMEN", proprietario: "55.626.983 WESLEY DAYRTON DO NASCIMENTO", nMotorista: "1485", placa: "MKN1D60", cidade: "LONDRINA", cpf: "040.092.369-65" },

    // 3/4
    { tipo: "3/4", transportador: "5574", lcont: "481", motorista: "ALEXSANDRO SILVA DA COSTA", proprietario: "ALEXSANDRO SILVA DA COSTA 52961181", nMotorista: "1481", placa: "LOM8J38", cidade: "ROLÂNDIA", cpf: "057.319.894-27" },
    { tipo: "3/4", transportador: "1354", lcont: "354", motorista: "BRUNO ARAUJO AUGUSTO", proprietario: "BRUNO ARAUJO AUGUSTO", nMotorista: "1354", placa: "MFF-8I90", cidade: "LONDRINA", cpf: "074.314.979-38" },
    { tipo: "3/4", transportador: "5740", lcont: "495", motorista: "CARLOS ALBERTO DE OLIVEIRA", proprietario: "CARLOS ALBERTO DE OLIVEIRA 5552297", nMotorista: "1495", placa: "BCC4F88", cidade: "LONDRINA", cpf: "045.271.859-77" },
    { tipo: "3/4", transportador: "183290", lcont: "554", motorista: "CARLOS ZOBERTO ECHAMENDI", proprietario: "CARLOS ZOBERTO ECHAMENDI", nMotorista: "1133", placa: "LPP0J82", cidade: "ROLÂNDIA", cpf: "729.331.519-87" },
    { tipo: "3/4", transportador: "22850", lcont: "850", motorista: "CLAUDEMIR DOS SANTOS", proprietario: "CLAUDEMIR DOS SANTOS", nMotorista: "1117", placa: "AZA5H43", cidade: "LONDRINA", cpf: "628.556.899-53" },
    { tipo: "3/4", transportador: "22820", lcont: "820", motorista: "CLAUDINEI APARECIDO BRISDA", proprietario: "CLAUDINEI APARECIDO BRISDA", nMotorista: "1234", placa: "OIF4B89", cidade: "ARAPONGAS", cpf: "916.716.209-68" },
    { tipo: "3/4", transportador: "5540", lcont: "464", motorista: "EVERTON ROBSON DA SILVA", proprietario: "EVERTON ROBSON DA SILVA 54104284", nMotorista: "1464", placa: "ARV7J35", cidade: "LONDRINA", cpf: "066.518.199-09" },
    { tipo: "3/4", transportador: "22800", lcont: "800", motorista: "EDSON MESSIAS", proprietario: "EDSON MESSIAS", nMotorista: "973", placa: "CPR0J63", cidade: "ARAPONGAS", cpf: "759.456.229-15" },
    { tipo: "3/4", transportador: "22855", lcont: "855", motorista: "FLAVIO ANTONIO DE CARVALHO", proprietario: "FLAVIO ANTONIO DE CARVALHO", nMotorista: "986", placa: "ARB5176", cidade: "LONDRINA", cpf: "020.130.639-54" },
    { tipo: "3/4", transportador: "22816", lcont: "816", motorista: "GENIEL DE SOUSA POLICANTI AS", proprietario: "GENIEL DE SOUSA POLICANTI AS", nMotorista: "1226", placa: "AOQ0A48", cidade: "ARAPONGAS", cpf: "010.232.912-58" },
    { tipo: "3/4", transportador: "722", lcont: "722", motorista: "IRINEU CARDOSO DE MOURA", proprietario: "IRINEU CARDOSO DE MOURA", nMotorista: "633", placa: "AHK0011", cidade: "CAMBÉ", cpf: "958.147.878-72" },
    { tipo: "3/4", transportador: "22835", lcont: "821", motorista: "JOAO VITOR TREDER CHACON", proprietario: "JOAO VITOR TREDER CHACON", nMotorista: "1270", placa: "MDV8J42", cidade: "ARAPONGAS", cpf: "114.223.409-61" },
    { tipo: "3/4", transportador: "22760", lcont: "908", motorista: "JOSE BENEDITO DE OLIVEIRA", proprietario: "JOSE BENEDITO DE OLIVEIRA", nMotorista: "942", placa: "IYL0H15", cidade: "ARAPONGAS", cpf: "878.640.379-68" },
    { tipo: "3/4", transportador: "22803", lcont: "803", motorista: "JULIANO NUNES KISTENMACHER", proprietario: "JULIANO NUNES KISTENMACHER", nMotorista: "1196", placa: "APF0E63", cidade: "LONDRINA", cpf: "035.383.359-23" },
    { tipo: "3/4", transportador: "22934", lcont: "934", motorista: "MARCELO APARECIDO RONCA", proprietario: "TR ANTUNES TRANSPORTES LTDA", nMotorista: "934", placa: "NSA0F34", cidade: "ARAPONGAS", cpf: "029.582.039-05" },
    { tipo: "3/4", transportador: "5588", lcont: "477", motorista: "MARCO FABIO GARCIA", proprietario: "MARCO FABIO GARCIA 55139516", nMotorista: "1477", placa: "ASJ4A45", cidade: "APUCARANA", cpf: "041.257.959-67" },
    { tipo: "3/4", transportador: "241", lcont: "241", motorista: "MAURO DA SILVA", proprietario: "MAURO DA SILVA", nMotorista: "198", placa: "AWZ3A35", cidade: "LONDRINA", cpf: "455.615.169-49" },
    { tipo: "3/4", transportador: "5901", lcont: "970", motorista: "NEYMAR KONOPKA", proprietario: "NEYMAR KONOPKA", nMotorista: "668", placa: "AXY7G76", cidade: "LONDRINA", cpf: "971.041.329-53" },
    { tipo: "3/4", transportador: "5589", lcont: "854", motorista: "OLIVIO PIRES GONCALVES", proprietario: "OLIVIO PIRES GONCALVES 56.132.", nMotorista: "1482", placa: "JJ24G84", cidade: "JATAIZINHO", cpf: "275.076.938-80" },
    { tipo: "3/4", transportador: "5561", lcont: "", motorista: "PAULO ROGERIO FRANQUELO", proprietario: "RONALDO APARECIDO GUIDINI", nMotorista: "1526", placa: "GOV1D72", cidade: "", cpf: "307.604.588-12" },
    { tipo: "3/4", transportador: "5513", lcont: "432", motorista: "ROBERTO ROMOALDO DA SILVA", proprietario: "ROBERTO ROMOALDO DA SILVA", nMotorista: "1432", placa: "ACC3A57", cidade: "APUCARANA", cpf: "019.301.949-35" },
    { tipo: "3/4", transportador: "5528", lcont: "460", motorista: "VALDINEI JOSE CALCADO", proprietario: "VALDINEI JOSE CALCADO 53915992", nMotorista: "1460", placa: "KCR2F43", cidade: "APUCARANA", cpf: "021.590.299-80" },
    { tipo: "3/4", transportador: "6341", lcont: "192", motorista: "WESLEY HUGO DOS SANTOS", proprietario: "WESLEY HUGO DOS SANTOS", nMotorista: "15", placa: "MIC4I76", cidade: "LONDRINA", cpf: "073.725.029-18" },

    // TOCO
    { tipo: "TOCO", transportador: "321", lcont: "321", motorista: "CLOVIS AUGUSTO GUIMARAES", proprietario: "CLAUDIO AUGUSTO GUIMARAES", nMotorista: "379", placa: "AFJ7812", cidade: "LONDRINA", cpf: "277.047.509-68" },
    { tipo: "TOCO", transportador: "5056", lcont: "419", motorista: "VOLMIR DA SILVA", proprietario: "49.355.103 VOLMIR DA SILVA", nMotorista: "1419", placa: "AME2C78", cidade: "ROLÂNDIA", cpf: "018.561.439-61" },
    { tipo: "TOCO", transportador: "655", lcont: "814", motorista: "SILVIO CESAR SHIGEAKI FURUMIT", proprietario: "SILVIO CESAR SHIGEAKI FURUMITI", nMotorista: "714", placa: "DJC2D45", cidade: "LONDRINA", cpf: "020.744.719-55" }
];

// Estado atual do painel de Agendamentos Trize
let trizeFiltroVeiculo = "TODOS";
let trizeFiltroBusca = "";

// Retorna a lista completa de motoristas (estáticos + customizados salvos no localStorage)
function getTrizeMotoristas() {
    try {
        const custom = JSON.parse(localStorage.getItem('apex_trize_custom_motoristas') || '[]');
        return [...TRIZE_MOTORISTAS, ...custom];
    } catch (e) {
        console.error("Erro ao carregar motoristas customizados do Trize:", e);
        return TRIZE_MOTORISTAS;
    }
}

// Inicialização do módulo quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    initTrizeAgendamentos();
});

function initTrizeAgendamentos() {
    console.log("Iniciando Módulo de Agendamentos Trize...");

    // Adiciona escutador para a busca
    const searchInput = document.getElementById("trizeSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            trizeFiltroBusca = e.target.value;
            renderTrizeMotoristas();
        });
    }

    // Adiciona escutadores para os botões de abas/filtros
    const filterButtons = document.querySelectorAll(".trize-filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            trizeFiltroVeiculo = e.currentTarget.getAttribute("data-veiculo");
            renderTrizeMotoristas();
        });
    });

    // Renderização inicial
    renderTrizeMotoristas();
}

// Renderiza a lista de motoristas com base nos filtros ativos
function renderTrizeMotoristas() {
    const listContainer = document.getElementById("trizeList");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    // Filtra os dados
    const motoristasFiltrados = getTrizeMotoristas().filter(m => {
        // Filtro por tipo de veículo
        const matchVeiculo = trizeFiltroVeiculo === "TODOS" || m.tipo === trizeFiltroVeiculo;

        // Filtro por busca de texto (Nome, CPF, Placa, Proprietario ou Cidade)
        const buscaClean = trizeFiltroBusca.toLowerCase().trim();
        const matchBusca = !buscaClean || 
            m.motorista.toLowerCase().includes(buscaClean) ||
            m.cpf.toLowerCase().includes(buscaClean) ||
            m.placa.toLowerCase().includes(buscaClean) ||
            m.cidade.toLowerCase().includes(buscaClean) ||
            m.proprietario.toLowerCase().includes(buscaClean);

        return matchVeiculo && matchBusca;
    });

    // Contador de resultados
    const counterBadge = document.getElementById("trizeResultsCounter");
    if (counterBadge) {
        counterBadge.textContent = `${motoristasFiltrados.length} motorista(s) encontrado(s)`;
    }

    if (motoristasFiltrados.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-search fs-1 mb-2 d-block"></i>
                Nenhum motorista encontrado para os critérios informados.
            </div>
        `;
        return;
    }

    // Renderiza cada motorista
    motoristasFiltrados.forEach((m, index) => {
        const item = document.createElement("div");
        item.className = "trize-item border border-secondary border-opacity-10 mb-2 rounded-3 overflow-hidden transition-all bg-dark bg-opacity-20";
        item.style.animation = `fade-in-slide 0.2s ease-out ${Math.min(index * 0.03, 0.5)}s both`;
        
        const uniqueId = `trize-collapse-${m.placa}-${index}`;
        const cleanCpf = m.cpf.replace(/\D/g, '');

        // Verifica se o motorista foi cadastrado dinamicamente
        let isCustom = false;
        try {
            const customList = JSON.parse(localStorage.getItem('apex_trize_custom_motoristas') || '[]');
            isCustom = customList.some(customM => customM.placa === m.placa && customM.cpf === m.cpf);
        } catch (e) {
            console.error(e);
        }

        let actionRowHtml = "";
        if (isCustom) {
            actionRowHtml = `
                <div class="d-flex justify-content-end mt-3 pt-2 border-top border-secondary border-opacity-10">
                    <button class="btn btn-xs btn-outline-danger d-flex align-items-center gap-1.5 px-3 py-1" onclick="window.excluirMotoristaTrize('${m.placa}', '${m.cpf}', '${m.motorista}')" style="border-radius: 4px; font-size: 0.7rem; transition: all 0.2s;">
                        <i class="bi bi-trash-fill"></i>
                        Excluir Motorista
                    </button>
                </div>
            `;
        }

        item.innerHTML = `
            <!-- Painel Principal (Cabeçalho do Motorista) -->
            <div class="d-flex align-items-center justify-content-between p-3 gap-2 flex-wrap flex-md-nowrap trize-header-row" style="cursor: pointer;">
                <div class="d-flex align-items-center gap-3 flex-grow-1" onclick="toggleTrizeCollapse('${uniqueId}', this)">
                    <div class="trize-badge-veiculo bg-opacity-10 text-uppercase fw-bold rounded px-2 py-1 small border border-opacity-25 ${getVeiculoBadgeClass(m.tipo)}" style="font-size: 0.7rem; min-width: 75px; text-align: center;">
                        ${m.tipo}
                    </div>
                    <div class="text-truncate">
                        <h4 class="h6 mb-0 text-white fw-semibold text-truncate" title="${m.motorista}">${m.motorista}</h4>
                        <span class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-geo-alt-fill me-1"></i>${m.cidade || "Não Informada"}</span>
                    </div>
                </div>
                
                <!-- Coluna CPF e Placa com botões de copiar -->
                <div class="d-flex align-items-center gap-3 flex-shrink-0 trize-actions-row">
                    <!-- CPF -->
                    <div class="d-flex flex-column text-md-end">
                        <span class="text-xs text-muted">CPF</span>
                        <div class="input-group input-group-sm rounded bg-dark border border-secondary border-opacity-25 overflow-hidden" style="max-width: 165px;">
                            <span class="form-control form-control-sm bg-transparent border-0 text-light py-0 px-2 fw-mono" style="font-size: 0.8rem; height: 26px; line-height: 26px;">${cleanCpf}</span>
                            <button class="btn btn-outline-secondary border-0 text-warning bg-opacity-10 py-0 px-2 btn-trize-copy transition-all" type="button" title="Copiar CPF" onclick="copyTrizeText('${cleanCpf}', this)">
                                <i class="bi bi-clipboard-fill" style="font-size: 0.8rem;"></i>
                            </button>
                        </div>
                    </div>
 
                    <!-- Placa -->
                    <div class="d-flex flex-column text-md-end">
                        <span class="text-xs text-muted">Placa</span>
                        <div class="input-group input-group-sm rounded bg-dark border border-secondary border-opacity-25 overflow-hidden" style="max-width: 125px;">
                            <span class="form-control form-control-sm bg-transparent border-0 text-light py-0 px-2 fw-mono" style="font-size: 0.8rem; height: 26px; line-height: 26px; letter-spacing: 0.5px;">${m.placa}</span>
                            <button class="btn btn-outline-secondary border-0 text-warning bg-opacity-10 py-0 px-2 btn-trize-copy transition-all" type="button" title="Copiar Placa" onclick="copyTrizeText('${m.placa}', this)">
                                <i class="bi bi-clipboard-fill" style="font-size: 0.8rem;"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Botão de Expandir -->
                    <button class="btn btn-link btn-xs text-secondary p-1 ms-1 btn-trize-toggle" onclick="toggleTrizeCollapse('${uniqueId}', this)" title="Ver Detalhes">
                        <i class="bi bi-chevron-down fs-5 transition-all"></i>
                    </button>
                </div>
            </div>
 
            <!-- Painel de Detalhes Expandido (Opção C) -->
            <div id="${uniqueId}" class="trize-details-pane collapse" style="background: rgba(255,255,255,0.015); border-top: 1px solid rgba(255,255,255,0.03);">
                <div class="p-3">
                    <div class="row g-3">
                        <div class="col-6 col-md-3">
                            <div class="p-2 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                                <span class="d-block text-xs text-muted text-uppercase mb-1" style="letter-spacing: 0.5px; font-size: 0.65rem;">Proprietário</span>
                                <span class="text-sm text-light fw-medium text-truncate d-block" title="${m.proprietario}">${m.proprietario || "-"}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                                <span class="d-block text-xs text-muted text-uppercase mb-1" style="letter-spacing: 0.5px; font-size: 0.65rem;">Nº Motorista</span>
                                <span class="text-sm text-light fw-medium d-block">${m.nMotorista || "Não Informado"}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                                <span class="d-block text-xs text-muted text-uppercase mb-1" style="letter-spacing: 0.5px; font-size: 0.65rem;">LCONT</span>
                                <span class="text-sm text-light fw-medium d-block">${m.lcont || "-"}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                                <span class="d-block text-xs text-muted text-uppercase mb-1" style="letter-spacing: 0.5px; font-size: 0.65rem;">Transportador</span>
                                <span class="text-sm text-light fw-medium d-block">${m.transportador || "-"}</span>
                            </div>
                        </div>
                    </div>
                    ${actionRowHtml}
                </div>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// Retorna cores distintas e premium para cada tipo de veículo
function getVeiculoBadgeClass(tipo) {
    switch (tipo) {
        case "FIORINO":
            return "bg-success text-success border-success";
        case "VAN":
            return "bg-primary text-primary border-primary";
        case "3/4":
            return "bg-danger text-danger border-danger";
        case "TOCO":
            return "bg-warning text-warning border-warning";
        default:
            return "bg-secondary text-secondary border-secondary";
    }
}

// Expande ou recolhe o painel de detalhes do motorista
function toggleTrizeCollapse(targetId, triggerElement) {
    const pane = document.getElementById(targetId);
    if (!pane) return;

    const isCollapsed = !pane.classList.contains("show");
    
    // Pega o card pai
    const card = pane.closest(".trize-item");
    
    // Pega o botão do chevron
    let toggleBtn;
    if (triggerElement.classList.contains("btn-trize-toggle")) {
        toggleBtn = triggerElement;
    } else {
        toggleBtn = card.querySelector(".btn-trize-toggle");
    }

    if (isCollapsed) {
        pane.classList.add("show");
        card.classList.add("border-primary", "bg-opacity-40");
        card.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.1)";
        if (toggleBtn) {
            toggleBtn.querySelector("i").style.transform = "rotate(180deg)";
        }
    } else {
        pane.classList.remove("show");
        card.classList.remove("border-primary", "bg-opacity-40");
        card.style.boxShadow = "none";
        if (toggleBtn) {
            toggleBtn.querySelector("i").style.transform = "rotate(0deg)";
        }
    }
}

// Copia o texto para a área de transferência com feedback tátil de alta qualidade
function copyTrizeText(text, btnElement) {
    if (!navigator.clipboard) {
        // Fallback clássico se necessário
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            showCopySuccessFeedback(btnElement);
        } catch (err) {
            console.error("Erro ao copiar: ", err);
        }
        document.body.removeChild(textArea);
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            showCopySuccessFeedback(btnElement);
        })
        .catch(err => {
            console.error("Erro ao copiar text: ", err);
        });
}

// Exibe feedback visual premium de sucesso (mudança de ícone, pulsar e cor)
function showCopySuccessFeedback(btnElement) {
    const originalIcon = btnElement.innerHTML;
    
    // Modifica para ícone de checkmark verde brilhante com transição
    btnElement.innerHTML = `<i class="bi bi-check2 text-success" style="font-size: 0.85rem; font-weight: bold;"></i>`;
    btnElement.classList.add("bg-success", "bg-opacity-20", "border-success");
    btnElement.style.transform = "scale(1.15)";
    
    // Adiciona classe de animação pulse se desejado
    btnElement.classList.add("btn-copied-pulse");

    setTimeout(() => {
        btnElement.innerHTML = originalIcon;
        btnElement.classList.remove("bg-success", "bg-opacity-20", "border-success", "btn-copied-pulse");
        btnElement.style.transform = "scale(1)";
    }, 1200);
}

// Salva um novo motorista cadastrado a partir do modal de Agendamentos Trize
window.salvarNovoMotoristaTrize = async function (e) {
    if (e) e.preventDefault();

    const tipo = document.getElementById("trizeNovoTipo").value;
    const motorista = document.getElementById("trizeNovoMotorista").value.trim().toUpperCase();
    const transportador = document.getElementById("trizeNovoTransportador").value.trim();
    const lcont = document.getElementById("trizeNovoLcont").value.trim();
    const proprietario = document.getElementById("trizeNovoProprietario").value.trim().toUpperCase();
    const nMotorista = document.getElementById("trizeNovoNMotorista").value.trim();
    const placa = document.getElementById("trizeNovoPlaca").value.trim().toUpperCase();
    const cidade = document.getElementById("trizeNovoCidade").value.trim().toUpperCase();
    const cpf = document.getElementById("trizeNovoCpf").value.trim();

    if (!tipo || !motorista || !placa || !cpf) {
        if (typeof showToast === 'function') {
            showToast("Por favor, preencha todos os campos obrigatórios: Motorista, Tipo, Placa e CPF.", "danger");
        } else {
            alert("Por favor, preencha todos os campos obrigatórios: Motorista, Tipo, Placa e CPF.");
        }
        return;
    }

    const novoMotorista = {
        tipo,
        transportador: transportador || "-",
        lcont: lcont || "-",
        motorista,
        proprietario: proprietario || motorista,
        nMotorista: nMotorista || "-",
        placa,
        cidade: cidade || "Não Informada",
        cpf
    };

    try {
        // 1. Salva no localStorage para o Trize
        const custom = JSON.parse(localStorage.getItem('apex_trize_custom_motoristas') || '[]');
        // Evita duplicatas por CPF/Placa
        const index = custom.findIndex(m => m.placa === placa || m.cpf === cpf);
        if (index > -1) {
            custom[index] = novoMotorista;
        } else {
            custom.push(novoMotorista);
        }
        localStorage.setItem('apex_trize_custom_motoristas', JSON.stringify(custom));

        // 2. Tenta sincronizar os dados básicos com a tabela email_motoristas no Supabase (se disponível)
        if (typeof supabase !== 'undefined') {
            try {
                const client = supabase.createClient('https://izpcrgnevzwparsslchd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cGNyZ25ldnp3cGFyc3NsY2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMjAxNTMsImV4cCI6MjA4NDY5NjE1M30.xYtk3mzOjSCYCNv3P5eq5aEmRUFSA_ERa58ABdL5Tpk');
                if (client) {
                    await client.from('email_motoristas').upsert([{
                        nome: motorista,
                        codigo: lcont || "000",
                        placa: placa
                    }], { onConflict: 'nome' });
                    console.log("Motorista sincronizado com o Supabase com sucesso.");
                    
                    // Se o gerador de email possuir a funcao popularSelects no escopo global/window, chama para sincronizar
                    if (typeof popularSelects === 'function') {
                        await popularSelects();
                    }
                }
            } catch (errSupabase) {
                console.warn("Erro ao sincronizar com Supabase, mantido apenas local:", errSupabase);
            }
        }

        // 3. Atualiza a lista na tela
        renderTrizeMotoristas();

        // 4. Limpa o formulário e fecha o modal
        document.getElementById("trizeNovoMotoristaForm").reset();
        
        const modalEl = document.getElementById("novoMotoristaTrizeModal");
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
        }

        if (typeof showToast === 'function') {
            showToast(`Motorista ${motorista} cadastrado com sucesso!`, "success");
        } else {
            alert(`Motorista ${motorista} cadastrado com sucesso!`);
        }

    } catch (e) {
        console.error("Erro ao salvar motorista no Trize:", e);
        if (typeof showToast === 'function') {
            showToast("Erro ao cadastrar motorista.", "danger");
        } else {
            alert("Erro ao cadastrar motorista.");
        }
    }
};

// Remove um motorista customizado do localstorage e do Supabase (se aplicavel)
window.excluirMotoristaTrize = async function (placa, cpf, nome) {
    if (!confirm(`Deseja realmente excluir o motorista "${nome}"?`)) return;

    try {
        // 1. Remove do localStorage do Trize
        let custom = JSON.parse(localStorage.getItem('apex_trize_custom_motoristas') || '[]');
        custom = custom.filter(m => m.placa !== placa || m.cpf !== cpf);
        localStorage.setItem('apex_trize_custom_motoristas', JSON.stringify(custom));

        // 2. Tenta remover do Supabase se o cliente estiver disponível
        if (typeof supabase !== 'undefined') {
            try {
                const client = supabase.createClient('https://izpcrgnevzwparsslchd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cGNyZ25ldnp3cGFyc3NsY2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMjAxNTMsImV4cCI6MjA4NDY5NjE1M30.xYtk3mzOjSCYCNv3P5eq5aEmRUFSA_ERa58ABdL5Tpk');
                if (client) {
                    await client.from('email_motoristas').delete().eq('nome', nome);
                    console.log("Motorista removido do Supabase com sucesso.");
                    
                    // Sincroniza selects se o modulo de email estiver ativo
                    if (typeof popularSelects === 'function') {
                        await popularSelects();
                    }
                }
            } catch (errSupabase) {
                console.warn("Erro ao excluir do Supabase:", errSupabase);
            }
        }

        // 3. Atualiza a lista na tela
        renderTrizeMotoristas();

        if (typeof showToast === 'function') {
            showToast(`Motorista ${nome} excluído com sucesso.`, "success");
        } else {
            alert(`Motorista ${nome} excluído com sucesso.`);
        }
    } catch (e) {
        console.error("Erro ao excluir motorista:", e);
        if (typeof showToast === 'function') {
            showToast("Erro ao excluir motorista.", "danger");
        } else {
            alert("Erro ao excluir motorista.");
        }
    }
};
