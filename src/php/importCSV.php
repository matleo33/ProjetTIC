<?php

if(isset($_FILES['userfile'])) {
    $content=file_get_contents($_FILES['userfile']);
}
echo $content;
//header('Location: ../html/index.php');

?>