<?php 

include("header.php");


if($_POST['submit']){
    
  $post = mysqli_real_escape_string($connection,$_POST['post']);
  $user_id = $_SESSION['user_id'];

    $queryResult =  queryFunc("INSERT INTO posts(post,user_id,createdAt) VALUES('$post','$user_id',now())");

    if($queryResult){
      redirection('main.php');
    }
  }


?>