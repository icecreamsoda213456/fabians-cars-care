<?php
  $page_title = 'Home Page';
  require_once('includes/load.php');
  if (!$session->isUserLoggedIn(true)) { redirect('index.php', false);}
?>
<?php include_once('layouts/header.php'); ?>
<?php
$result;
if (isset($_POST['submit_code'])) {
  $barcode = remove_junk($db->escape($_POST['product-barcode']));
  $query  = "SELECT * from products WHERE barcode = '{$barcode}'";
  
  $result = $db->query($query);

  while($row = $result->fetch_assoc()){

    $product[]=$row;
  }
  
}

?>
<div class="row">
 <form  id="Form" action="#" method="post" >
 <input type="text" class="form-control" name="product-barcode" placeholder="product-barcode" autofocus onkeydown="return event.key != 'Enter';" />
 <input  type="submit" id="submit_code" name="submit_code">


</form>  
 <div class="panel">
    <div style="overflow-y:auto; height: 30rem">
    <table class="table">
      <thead class="thead-dark">
        <tr style="background: gray;top: 0; position:sticky;">
          <th style="position: sticky;top: 0;color:white;">Product Name</th>
          <th style="position: sticky;top: 0;color:white;">Price</th>
          <th style="position: sticky;top: 0;color:white;">Quantity</th>
          <th style="position: sticky;top: 0;color:white; width: 50px">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($product as $product):?>
        <tr>
          <td ><?php echo remove_junk($product['name']); ?></td>
          <td ><?php echo remove_junk($product['buy_price']); ?></td>
          <td >Smith</td>
          <td ><button type="button" name="" id="" class="btn btn-danger"><i class="fa fa-close"></i></button></td>
        </tr>
        <?php endforeach ?>
      </tbody>
    </table>
  
  </div>
  
 </div>
 <div style="position:relative;right:0;background:wheat; flex-direction:row; ">
    <button value="Buy" name="buy" id="buy" class="btn btn-primary">Buy</button>
  </div>
</div>
<?php include_once('layouts/footer.php'); ?>
<script>
$("product-barcode").keyup(function(){
  if(this.value.length==14){
    $('submit_code').click();
  }
})
</script>

