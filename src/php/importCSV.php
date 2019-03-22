<?php

if(isset($_FILES['userfile'])) {
    $content=file_get_contents($_FILES);
}
echo $content;
//header('Location: ../html/index.php');

?>