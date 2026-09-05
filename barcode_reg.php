<?php

if(isset($_POST['barcode'])){
    
                $current_time=time();
                $DateTime=strftime("%d-%m-%y  %H:%M:%S",$current_time);
                $DateTime;
    
    
    $barcode=$_POST['barcode'];

    echo $barcode;
                
}

?>