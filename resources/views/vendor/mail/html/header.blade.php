@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" class="brand-link">
{{-- Marca do sistema em HTML puro (sem imagem/SVG, que Gmail e Outlook bloqueiam ou não exibem) --}}
<table class="brand" align="center" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="brand-mark">CI</td>
<td class="brand-text">
<span class="brand-name">{{ $slot }}</span><br>
<span class="brand-tagline">Sistema de Conexão Urbana</span>
</td>
</tr>
</table>
</a>
</td>
</tr>
