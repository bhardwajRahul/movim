{loop="$list"}<li id="blocked-{$value->id|cleanupId}">
    <span class="primary icon gray">
        <i class="material-symbols">person</i>
    </span>
    <span class="control icon active divided" onclick="Blocked_ajaxUnblock('{$value->id|echapJS}')">
        <i class="material-symbols">close</i>
    </span>
    <div>
        <p class="line normal">
            {$value->id}
        </p>
    </div>
</li>{/loop}
