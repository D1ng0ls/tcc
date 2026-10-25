<?php

namespace App\Support;

/**
 * Departamentos que toda prefeitura recebe, com o texto do "?" (o que deve ser enviado para
 * cada um) e as palavras-chave usadas para sugerir o departamento a partir do texto da
 * reclamação. As palavras são separadas por vírgula; "*" no fim pega as variações
 * (ex.: "alag*" pega alagamento, alagado, alagou). A prefeitura pode editar as duas coisas.
 */
class DepartmentDefaults
{
    public const DEPARTMENTS = [
        'Meio Ambiente' => [
            'description' => 'Limpeza urbana e meio ambiente: lixo e entulho, coleta, mato alto, poda e queda de árvores, queimadas, poluição e descarte irregular.',
            'keywords' => 'lixo, lixeira, entulho, coleta, coleta seletiva, reciclage*, caçamba, descarte, mato, matagal, capina, roçada, terreno baldio, terreno abandonado, árvore, galho, poda, queimada, fumaça, poluição, polui*, córrego, nascente, desmatamento, sujeira, sujo, mau cheiro, fedor, varrição',
        ],
        'Saúde' => [
            'description' => 'Saúde pública e vigilância sanitária: atendimento em UBS, UPA e hospitais, falta de remédios, dengue e água parada, animais abandonados e pragas (ratos, escorpiões).',
            'keywords' => 'saúde, posto de saúde, ubs, upa, hospital, pronto-socorro, pronto atendimento, médico, médica, enfermeir*, consulta, exame, remédio, medicamento, farmácia, vacina*, ambulância, samu, dengue, mosquito, aedes, água parada, foco de dengue, rato, barata, escorpi*, pombo, praga, dedetiza*, zoonose, animal abandonado, animais abandonados, cachorro, gato, vigilância sanitária, carrapato, caramujo',
        ],
        'Infraestrutura' => [
            'description' => 'Ruas, calçadas, iluminação pública, água, esgoto, drenagem e obras: buracos, postes apagados, vazamentos, bueiros entupidos, alagamentos e pontos de ônibus danificados.',
            'keywords' => 'buraco, cratera, asfalt*, pavimenta*, recape*, calçada, calçamento, meio-fio, sarjeta, iluminação, lâmpada, poste, apagad*, escur*, esgoto, bueiro, boca de lobo, galeria, drenagem, alag*, enchente, vazamento, vazando, cano, encanamento, tubula*, água, ponte, viaduto, obra, ponto de ônibus, abrigo de ônibus, erosão',
        ],
        'Segurança Pública' => [
            'description' => 'Trânsito e segurança: semáforos, sinalização e faixas, lombadas, veículos abandonados, estacionamento irregular, vandalismo, perturbação do sossego e falta de policiamento ou guarda municipal.',
            'keywords' => 'semáforo, farol, sinaleiro, sinalização, placa, faixa de pedestre, lombada, quebra-mola, radar, trânsito, acidente, carro abandonado, veículo abandonado, estaciona*, assalto, roubo, furto, violência, briga, vandalismo, depreda*, guarda municipal, policiamento, polícia, insegur*, droga*, som alto, barulho, perturbação, ruído, pancadão, racha',
        ],
        'Educação' => [
            'description' => 'Escolas e creches municipais: vagas, merenda, transporte escolar, estrutura das unidades e falta de professores.',
            'keywords' => 'escola, creche, emei, emef, professor*, aluno, aula, merenda, transporte escolar, ônibus escolar, vaga em creche, matrícula, ensino, educação, diretora, diretor da escola, material escolar, uniforme escolar',
        ],
        'Economia' => [
            'description' => 'Tributos e atividades econômicas: IPTU, ISS e taxas, cobranças, alvarás, comércio, feiras e ambulantes.',
            'keywords' => 'iptu, iss, imposto, taxa, tributo, cobrança, boleto, carnê, alvará, licença de funcionamento, comércio, comerciante, loja, feira, feirante, ambulante, camelô, nota fiscal, desemprego, mei, empreendedor*',
        ],
        'Justiça' => [
            'description' => 'Direitos do cidadão: Procon e direito do consumidor, assistência jurídica, direitos humanos, conselho tutelar, proteção de idosos e pessoas com deficiência.',
            'keywords' => 'procon, consumidor, direitos, direito do consumidor, jurídic*, advogad*, defensoria, conselho tutelar, idoso, maus-tratos, abuso, discriminação, racismo, preconceito, deficiência, assistência social, cras, creas',
        ],
        'Cultura' => [
            'description' => 'Cultura e patrimônio: bibliotecas, museus, teatros, centros culturais, eventos, monumentos e pichação em prédios públicos.',
            'keywords' => 'cultura, cultural, biblioteca, museu, teatro, cinema, centro cultural, casa de cultura, evento, festival, show, monumento, patrimônio, histórico, pichação, pichad*, artesanato',
        ],
        'Esporte' => [
            'description' => 'Esporte e lazer: quadras, ginásios, campos, academias ao ar livre, pistas de caminhada, piscinas, parquinhos e atividades esportivas.',
            'keywords' => 'esporte, esportiv*, quadra, ginásio, campo de futebol, campinho, academia ao ar livre, academia da terceira idade, pista de caminhada, piscina, estádio, campeonato, escolinha, futebol, vôlei, basquete, skate, parquinho, playground',
        ],
        'Outros' => [
            'description' => 'O que não se encaixa nos outros departamentos. A prefeitura encaminha para o setor certo.',
            'keywords' => null,
        ],
    ];

    /** Nomes na ordem em que são criados para cada prefeitura. */
    public static function names(): array
    {
        return array_keys(self::DEPARTMENTS);
    }
}
