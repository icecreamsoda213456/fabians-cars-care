<?php
  $page_title = 'Home Page';
  require_once('includes/load.php');
  if (!$session->isUserLoggedIn(true)) { redirect('index.php', false);}
?>
<?php include_once('layouts/header.php'); ?>
<?php 
$cash = 0;
$order_id = $_REQUEST["order_id"];
$cash = (float)$_REQUEST["cash"];
$total_order= 0;

$get_cart_query  = "SELECT * from cart WHERE order_id = '{$order_id}'";
  $cart_items = $db->query($get_cart_query);
  while($row = $cart_items->fetch_assoc()){
    $cart[] = $row;
    $total_order += $row['quantity'] * $row['price'];
    $cash -= $row['quantity'] * $row['price'];
  }

?>

<div class="row">
<div class="panel">
    <div style="overflow-y:auto; height: auto">
    <table class="table">
      <thead class="thead-dark">
        <tr style="background: gray;top: 0; position:sticky;">
          <th style="position: sticky;top: 0;color:white;">Product Name</th>
          <th style="position: sticky;top: 0;color:white;">Price</th>
          <th style="position: sticky;top: 0;color:white;">Quantity</th>
          <th style="position: sticky;top: 0;color:white;">Total Price</th>
          
        </tr>
      </thead>
      <tbody>
        <?php 
        if (isset($cart)) {
         
        
        foreach ($cart as $product):?>
        <tr>
          <td ><?php echo remove_junk($product['name']); ?></td>
          <td ><?php echo remove_junk($product['price']); ?></td>
          <td ><?php echo remove_junk($product['quantity']); ?></td>
          <td ><?php echo remove_junk($product['quantity']) * remove_junk($product['price']); ?></td>
        </tr>
        <?php endforeach;
      } ?>
      </tbody>
      
    </table>
  
  </div>
  <div style="display:flex; justify-content: end; flex-direction:row; padding-right:1em;">    
    <b class="h4" style="padding-right:1em">Total : </b>
    <input type="number" class="form-control"  style="width: 15em;margin-right:1em;" readonly name="total" value="<?php echo remove_junk($total_order); ?>" id="getTotal" />
    <b class="h4" style="padding-right:1em">Change : </b>
    <input type="number" class="form-control"  style="width: 15em;padding-right:1em;" readonly value="<?php echo remove_junk($cash); ?>" name="cash" id="cash" />
  </div>
 </div>
      
  </div>
  
 </div>

</div>
<?php include_once('layouts/footer.php'); ?>


