<?php

namespace App\Support;

/**
 * Normaliza nomes de bairro (UC018): tira espaços repetidos e padroniza maiúsculas e
 * minúsculas ("JARDIM  das flores" vira "Jardim das Flores"), para que a mesma sugestão
 * digitada de jeitos diferentes seja reconhecida como uma só.
 */
class NeighborhoodName
{
    /** Palavras que ficam em minúsculo no meio do nome. */
    private const LOWER = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];

    public static function normalize(?string $name): string
    {
        $name = trim(preg_replace('/\s+/u', ' ', (string) $name));
        if ($name === '') {
            return '';
        }

        $words = explode(' ', mb_strtolower($name, 'UTF-8'));

        foreach ($words as $i => $word) {
            if ($i > 0 && in_array($word, self::LOWER, true)) {
                continue;
            }
            // Algarismos romanos curtos (Jardim II, Vila IV) ficam em maiúsculo.
            if (preg_match('/^[ivx]{1,4}$/u', $word) && $i > 0) {
                $words[$i] = mb_strtoupper($word, 'UTF-8');
                continue;
            }
            $words[$i] = mb_convert_case($word, MB_CASE_TITLE, 'UTF-8');
        }

        return implode(' ', $words);
    }
}
