
<?php include "header.php"; ?>

<?php
  if(isset($_POST['send_message'])){
    sendMessage($_GET['id'],$_POST['message_body']);
}
  if(isset($_GET['id']))
    {
      $partner = queryFunc("select first_name from users where user_id =".$_GET['id']);
      $partner = isRecord($partner);
      echo "<h2>You and ". $partner['first_name'] ." </h2>";
      ?>
        <div id="messages_area">
      <?php
      showMessages($_GET['id']);
      ?>
      </div>
    <?php
      $id = $_GET['id'];
      $messageInput = <<<DELIMETER
        <form method="post" action="message.php?id=$id">
        <textarea name="message_body" placeholder="Type your message here"  id="message_textarea"></textarea>
        <input type="submit" name="send_message" id="message_submit" value="send">
        </form>
DELIMETER;
      echo $messageInput;     
}
  
?>


<script src="script.js" ></script>
