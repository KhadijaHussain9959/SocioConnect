<?php  require_once('functions.php'); 
      ob_start(); // Turn on ouput buffering
?>

<!-- Header Section of the website. Will be included in every page  -->

<html>
<head>
<!-- <link href="fonts/fontawesome-all.css" rel="stylesheet" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous"> -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous"> 
<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700,800" rel="stylesheet">
 <link rel="stylesheet" href="main.css">
</head>
<body onload="setUserId('<?php if(isset($_SESSION['user_id']))echo $_SESSION['user_id'];?>')">

<!-- Starting div of main content area of the website, where all the stuff lies -->
<div class="main-container">

  <!-- Start of header section -->
    <div class="header">
      <div class="header-heading">
        <h1><a href="main.php" class="heading_link">Socio Connect</a></h1>
      </div>
      
      
      <?php
  // Displaying this navbar if user is logged in
  if (isset($_SESSION['user_id'])) {
      $user = $_SESSION['user'];  // loggedIn username

      $pic = getUserProfilePic($_SESSION['user_id']); // Getting user pic

      $image = "<img src='{$pic}' class='post-avatar post-avatar-40' />"; ?>


      <!-- Search Bar to search Users -->
      <div class="header-search-bar">
        <input type="text" class="search-input" placeholder="Search" onkeyup="getUsers(this.value,1)" name="q" autocomplete = "off" >

        <!-- Results of search will be displayed in this div -->
      <div class='search-result'></div>
      </div>
      
      <!-- Header Buttons -->
      <div class="header-links">
        
        
        <!-- Notification Dropdown -->
        <div class='notification-dropdown'>
        <a href="javascript:toggleDropdown('.noti-dropdown');" class="header-btn mr-1 "><i class="fas fa-bell fa-lg"></i></a>
          
          <div class='noti-dropdown'>
          <h3>Notifications</h3>  
          <?php showNotifications(10,0,10)?>
          <a href="allNotification.php" class='see-more'>
            <span>See more</span>
          </a>
        </div>

        <div class='noti-count'>
        <?php  $value = CountDropdown(1); 
               if($value == 0){
                 echo "<script>document.querySelector('.noti-count').style.backgroundColor='transparent';</script>";
               }else{
                echo "<script>document.querySelector('.noti-count').style.backgroundColor='red';</script>";
                echo $value;
               }
        ?>
        </div>
  </div>
        <div class='message-dropdown'>
        <a href="javascript:toggleDropdown('.msg-dropdown');" class="header-btn mr-1"><i class="fas fa-envelope fa-lg"></i></a>

        <div class='msg-dropdown'>
        
          <h3>Messages</h3> 
          <div class='recent-chats-dropdown'>
          <?php showRecentChats(); ?>

  </div>
          <a href="messages.php" class='see-more'>
            <span>See more</span>
          </a>
        </div>

        <div class='msg-count'>
        <?php  $value = CountDropdown(2); 
               if($value == 0){
                 echo "<script>document.querySelector('.msg-count').style.backgroundColor='transparent';</script>";
               }else{
                echo "<script>document.querySelector('.msg-count').style.backgroundColor='red';</script>";
                echo $value;
               }
        ?>
        </div>
  </div>  
        

    <div class='request-dropdown'>
        <a href="javascript:toggleDropdown('.req-dropdown');" class="header-btn mr-1"><i class="fas fa-user-plus fa-lg"></i></a>

        <div class='req-dropdown'>
          <h3>Friend Requests</h3> 
          
          <?php showNotifications(1,0,10); ?>
  
          <a href="requests.php" class='see-more'>
            <span>See more</span>
          </a>
        </div>

        <div class='req-count'>
        <?php  $value = CountDropdown(3); 
               if($value == 0){
                 echo "<script>document.querySelector('.req-count').style.backgroundColor='transparent';</script>";
               }else{
                echo "<script>document.querySelector('.req-count').style.backgroundColor='red';</script>";
                echo $value;
               }
        ?>
        </div>
  </div>
        <a href="logout.php" class="header-btn mr-1" id="logout_id"><i class="fas fa-sign-out-alt fa-lg"></i></a>
        <a class='logged-user' href='timeline.php'>
          <?php echo $image ?>
          <span><?php echo $user ?></span>
        </a>
      </div>
  </div>
  <?php
  } else {
      ?>
    
    
  <?php
  }
  ?>