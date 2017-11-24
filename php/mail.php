<html>
<head><title>Practitioners Questionnaire</title></head>
<body>
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

require 'vendor/phpmailer/phpmailer/src/Exception.php';
require 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';

foreach ($_POST as $key => $value)
    $message .= "Field ".htmlspecialchars($key)." is ".htmlspecialchars($value)."<br>";

try {
	$mail = new PHPMailer();
	$mail->IsSMTP();
	$mail->CharSet = 'UTF-8';
	
	$mail->Host       = "w017955e.kasserver.com"; // SMTP server example
	$mail->SMTPDebug = 2; //Alternative to above constant
	$mail->SMTPAuth   = true;                  // enable SMTP authentication
	$mail->Port       = 25;                    // set the SMTP port for the GMAIL server
	$mail->Username   = "m041f542"; // SMTP account username example
	$mail->Password   = "wRovHunEKRKyxCa3";        // SMTP account password example

	//Recipients
    $mail->setFrom('tobi@datadissonance.org', 'Facelift');
    $mail->addAddress('tobias.kauer@fh-potsdam.de', 'Tobi');     // Add a recipient

	$mail->Subject = $message;

	$mail->send();
    echo 'Message has been sent';
    phpinfo();
	$mail->Debugoutput = function($str, $level) {echo "debug level $level; message: $str";};

} catch (Exception $e) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
}

?>
</body>
</html>