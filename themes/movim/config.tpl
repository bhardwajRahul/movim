<?php /* -*- mode: html -*- */
?>
<?php $this->widget('Poller');?>
<?php $this->widget('Logout');?>
<?php $this->widget('Chat');?>
<?php /*$this->widget('Log');*/?>

<div id="left">
    <?php $this->widget('Profile'); ?>

</div>
<div id="right">
    <?php $this->widget('Notifs');?>
    <?php $this->widget('Roster');?>
</div>
<div id="center" class="protect white">
  <h1><?php echo t('Configuration'); ?></h1>
  <?php $this->widget('Config');?>
</div>


