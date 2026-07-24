<!doctype html>
<html lang="en">
<body style="margin:0;background:#f1f5fb;color:#0b1930;font-family:Arial,sans-serif">
<table role="presentation" width="100%">
    <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:16px;padding:32px;border-top:4px solid #1557c0">
            <tr><td>
                <h1 style="margin:0 0 24px;color:#1557c0">NovaTrust Bank Security</h1>
                <p>Hello {{ $user->name }},</p>
                <p>We received a request to verify your identity.</p>
                @if($purpose === 'transfer')
                    <div style="padding:16px;background:#eaf2ff;border-radius:10px">
                        <strong>{{ $context['type'] ?? 'Transfer' }}</strong><br>
                        Amount: ${{ $context['amount'] ?? '—' }}<br>
                        From: {{ $context['from'] ?? '—' }}<br>
                        To: {{ $context['to'] ?? '—' }}
                    </div>
                @endif
                <p style="margin:28px 0 8px">Your verification code:</p>
                <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:0;color:#082b5c">{{ $code }}</p>
                <p>This code expires in 5 minutes and can be used only once.</p>
                <p>If you did not request this action, contact support immediately.</p>
            </td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
