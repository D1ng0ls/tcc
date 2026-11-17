<?php

namespace App\Support;

/**
 * CPF e CNPJ (RF006/UC005): validação dos dígitos verificadores no servidor e formatação
 * única ("000.000.000-00" / "00.000.000/0000-00"), para que a checagem de unicidade não
 * seja enganada por outra forma de escrever o mesmo número.
 */
class Documents
{
    public static function digits(?string $value): string
    {
        return preg_replace('/\D/', '', (string) $value);
    }

    public static function isValidCpf(?string $value): bool
    {
        $cpf = self::digits($value);
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $sum = 0;
            for ($i = 0; $i < $t; $i++) {
                $sum += (int) $cpf[$i] * (($t + 1) - $i);
            }
            $digit = ((10 * $sum) % 11) % 10;
            if ((int) $cpf[$t] !== $digit) {
                return false;
            }
        }

        return true;
    }

    public static function isValidCnpj(?string $value): bool
    {
        $cnpj = self::digits($value);
        if (strlen($cnpj) !== 14 || preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }

        $weights = [[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]];
        foreach ([12, 13] as $k => $position) {
            $sum = 0;
            for ($i = 0; $i < $position; $i++) {
                $sum += (int) $cnpj[$i] * $weights[$k][$i];
            }
            $rest = $sum % 11;
            $digit = $rest < 2 ? 0 : 11 - $rest;
            if ((int) $cnpj[$position] !== $digit) {
                return false;
            }
        }

        return true;
    }

    /** Formata o CPF com máscara; devolve o valor original se não tiver 11 dígitos. */
    public static function formatCpf(?string $value): ?string
    {
        $d = self::digits($value);

        return strlen($d) === 11 ? vsprintf('%s%s%s.%s%s%s.%s%s%s-%s%s', str_split($d)) : $value;
    }

    /** Formata o CNPJ com máscara; devolve o valor original se não tiver 14 dígitos. */
    public static function formatCnpj(?string $value): ?string
    {
        $d = self::digits($value);

        return strlen($d) === 14 ? vsprintf('%s%s.%s%s%s.%s%s%s/%s%s%s%s-%s%s', str_split($d)) : $value;
    }
}
