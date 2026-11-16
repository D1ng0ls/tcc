<?php

namespace App\Support;

use App\Models\Complaint;

/**
 * Proteção da identidade do cidadão nas reclamações (RNF006/RT006, LGPD).
 *
 * Só o próprio autor e o administrador sabem quem abriu a reclamação. Para os
 * demais — visitantes, outros cidadãos e a prefeitura — o conteúdo continua
 * público (título, descrição, endereço do problema), mas o autor aparece apenas
 * como "Cidadão": sem nome, sem id, sem dados cadastrais.
 */
class ComplaintPrivacy
{
    public static function viewerCanSeeAuthor(Complaint $complaint): bool
    {
        $user = auth('web')->user();

        return $user !== null
            && ($user->role === 'admin' || (int) $user->id === (int) $complaint->user_id);
    }

    /**
     * Prepara a reclamação (com as relações já carregadas) para a página de detalhes:
     * oculta o autor, o nome dele na linha do tempo e nas mensagens quando o
     * visualizador não pode vê-lo.
     */
    public static function forViewer(Complaint $complaint): Complaint
    {
        if (self::viewerCanSeeAuthor($complaint)) {
            return $complaint;
        }

        $complaint->makeHidden('user_id')->unsetRelation('user');

        if ($complaint->relationLoaded('events')) {
            $complaint->events
                ->where('actor_type', 'user')
                ->each->makeHidden(['actor_id', 'actor_name']);
        }

        if ($complaint->relationLoaded('messages')) {
            $complaint->messages
                ->where('author_type', 'user')
                ->each->makeHidden(['author_id', 'author_name']);
        }

        if ($complaint->relationLoaded('disputes')) {
            $complaint->disputes->each->makeHidden('user_id');
        }

        return $complaint;
    }

    /**
     * Para listagens que não são do próprio autor nem do admin: remove o id e a
     * relação do autor de cada reclamação.
     */
    public static function hideAuthors(iterable $complaints): void
    {
        foreach ($complaints as $complaint) {
            $complaint->makeHidden('user_id')->unsetRelation('user');
        }
    }
}
