$baseUrl = "http://localhost:5000/api/admin"

Write-Host "=== STARTING API SMOKE TESTS ==="

# Helper for HTTP requests catching status codes
function Invoke-TestRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    $params = @{
        Uri = $Uri
        Method = $Method
        Headers = $Headers
        ContentType = "application/json"
    }
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 5)
    }
    try {
        $res = Invoke-WebRequest @params -UseBasicParsing
        $json = $res.Content | ConvertFrom-Json
        return @{ Status = $res.StatusCode; Data = $json; Success = $true }
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $raw = $reader.ReadToEnd()
        $json = $null
        try { $json = $raw | ConvertFrom-Json } catch { $json = $raw }
        return @{ Status = $status; Data = $json; Success = $false }
    }
}

# TC-01: Admin Login Valid
$r1 = Invoke-TestRequest -Uri "$baseUrl/auth/login" -Method Post -Body @{ email = 'admin@library.com'; password = 'Admin@123' }
$token = $r1.Data.token
Write-Host ("TC-01 Admin Login Valid: Status=" + $r1.Status + " TokenAcquired=" + ([bool]$token))

# TC-02: Admin Login Wrong Password
$r2 = Invoke-TestRequest -Uri "$baseUrl/auth/login" -Method Post -Body @{ email = 'admin@library.com'; password = 'WrongPassword999' }
Write-Host ("TC-02 Admin Login Invalid: Status=" + $r2.Status + " Msg=" + $r2.Data.message)

# TC-03: Get Summary Without Token
$r3 = Invoke-TestRequest -Uri "$baseUrl/stats/summary" -Method Get
Write-Host ("TC-03 Summary No Token: Status=" + $r3.Status + " Msg=" + $r3.Data.message)

# TC-04: Student Login
$r4 = Invoke-TestRequest -Uri "$baseUrl/auth/login" -Method Post -Body @{ email = 'nimal@student.com'; password = 'Admin@123' }
Write-Host ("TC-04 Student Login: Status=" + $r4.Status + " Msg=" + $r4.Data.message)

$authHeaders = @{ Authorization = "Bearer $token" }

# TC-05: Summary With Token
$r5 = Invoke-TestRequest -Uri "$baseUrl/stats/summary" -Method Get -Headers $authHeaders
Write-Host ("TC-05 Summary Valid: Status=" + $r5.Status + " Books=" + $r5.Data.totalBooks + " Users=" + $r5.Data.totalUsers + " SeatsOccupied=" + $r5.Data.occupiedSeats)

# TC-06: Peak Hours
$r6 = Invoke-TestRequest -Uri "$baseUrl/stats/peak-hours" -Method Get -Headers $authHeaders
Write-Host ("TC-06 Peak Hours: Status=" + $r6.Status + " Count=" + $r6.Data.Length + " Hours=" + ($r6.Data[0].hour) + ".." + ($r6.Data[-1].hour))

# TC-07: Recent Activity
$r7 = Invoke-TestRequest -Uri "$baseUrl/stats/recent" -Method Get -Headers $authHeaders
Write-Host ("TC-07 Recent Activity: Status=" + $r7.Status + " Count=" + $r7.Data.Length)

# CRUD CATEGORIES
$rcatList = Invoke-TestRequest -Uri "$baseUrl/categories" -Method Get -Headers $authHeaders
$existingCatId = $rcatList.Data[0]._id
$rcatCreate = Invoke-TestRequest -Uri "$baseUrl/categories" -Method Post -Headers $authHeaders -Body @{ name = "TEST-Category-Auto" }
$testCatId = $rcatCreate.Data._id
Write-Host ("Categories Create: Status=" + $rcatCreate.Status + " ID=" + $testCatId)

$rcatUpdate = Invoke-TestRequest -Uri "$baseUrl/categories/$testCatId" -Method Put -Headers $authHeaders -Body @{ name = "TEST-Category-Updated" }
Write-Host ("Categories Update: Status=" + $rcatUpdate.Status + " Name=" + $rcatUpdate.Data.name)

$rcatDelete = Invoke-TestRequest -Uri "$baseUrl/categories/$testCatId" -Method Delete -Headers $authHeaders
Write-Host ("Categories Delete: Status=" + $rcatDelete.Status)

# CRUD BOOKS
$rbookCreate = Invoke-TestRequest -Uri "$baseUrl/books" -Method Post -Headers $authHeaders -Body @{ title = "TEST-Book-Title"; author = "TEST Author"; isbn = "9999999999999"; copies = 3; category = $existingCatId }
$testBookId = $rbookCreate.Data._id
Write-Host ("Books Create: Status=" + $rbookCreate.Status + " ID=" + $testBookId)

$rbookGet = Invoke-TestRequest -Uri "$baseUrl/books?search=TEST-Book" -Method Get -Headers $authHeaders
Write-Host ("Books Read: Status=" + $rbookGet.Status + " Found=" + $rbookGet.Data.Length)

$rbookUpdate = Invoke-TestRequest -Uri "$baseUrl/books/$testBookId" -Method Put -Headers $authHeaders -Body @{ title = "TEST-Book-Updated"; author = "TEST Author"; isbn = "9999999999999"; copies = 5; category = $existingCatId }
Write-Host ("Books Update: Status=" + $rbookUpdate.Status + " Title=" + $rbookUpdate.Data.title)

$rbookDelete = Invoke-TestRequest -Uri "$baseUrl/books/$testBookId" -Method Delete -Headers $authHeaders
Write-Host ("Books Delete: Status=" + $rbookDelete.Status)

# CRUD SEATS
$rseatCreate = Invoke-TestRequest -Uri "$baseUrl/seats" -Method Post -Headers $authHeaders -Body @{ label = "ZTEST1" }
$testSeatId = $rseatCreate.Data._id
Write-Host ("Seats Create: Status=" + $rseatCreate.Status + " ID=" + $testSeatId)

$rseatDup = Invoke-TestRequest -Uri "$baseUrl/seats" -Method Post -Headers $authHeaders -Body @{ label = "ZTEST1" }
Write-Host ("Seats Duplicate Check: Status=" + $rseatDup.Status + " Msg=" + $rseatDup.Data.message)

$rseatUpdate = Invoke-TestRequest -Uri "$baseUrl/seats/$testSeatId" -Method Put -Headers $authHeaders -Body @{ status = "Maintenance" }
Write-Host ("Seats Update: Status=" + $rseatUpdate.Status + " StatusVal=" + $rseatUpdate.Data.status)

$rseatDelete = Invoke-TestRequest -Uri "$baseUrl/seats/$testSeatId" -Method Delete -Headers $authHeaders
Write-Host ("Seats Delete: Status=" + $rseatDelete.Status)

# USERS READ
$ruserGet = Invoke-TestRequest -Uri "$baseUrl/users" -Method Get -Headers $authHeaders
Write-Host ("Users Read List: Status=" + $ruserGet.Status + " Count=" + $ruserGet.Data.Length)

# CRUD RESERVATIONS
$rresPending = Invoke-TestRequest -Uri "$baseUrl/reservations?status=Pending" -Method Get -Headers $authHeaders
Write-Host ("Reservations Pending List: Status=" + $rresPending.Status + " Count=" + $rresPending.Data.Length)

$studentUser = $ruserGet.Data | Where-Object { $_.role -eq 'Student' } | Select-Object -First 1
$studentUserId = $studentUser._id

$rresCreate = Invoke-TestRequest -Uri "$baseUrl/reservations" -Method Post -Headers $authHeaders -Body @{
    user = $studentUserId
    type = "Book"
    book = (Invoke-TestRequest -Uri "$baseUrl/books" -Method Get -Headers $authHeaders).Data[0]._id
    startTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    endTime = (Get-Date).AddDays(1).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}
$testResId = $rresCreate.Data._id
Write-Host ("Reservations Create: Status=" + $rresCreate.Status + " ID=" + $testResId)

$rresUpdateConf = Invoke-TestRequest -Uri "$baseUrl/reservations/$testResId" -Method Put -Headers $authHeaders -Body @{ status = "Confirmed" }
Write-Host ("Reservations Update Confirmed: Status=" + $rresUpdateConf.Status + " StatusVal=" + $rresUpdateConf.Data.status)

$rresUpdateCanc = Invoke-TestRequest -Uri "$baseUrl/reservations/$testResId" -Method Put -Headers $authHeaders -Body @{ status = "Cancelled" }
Write-Host ("Reservations Update Cancelled: Status=" + $rresUpdateCanc.Status + " StatusVal=" + $rresUpdateCanc.Data.status)

$rresDelete = Invoke-TestRequest -Uri "$baseUrl/reservations/$testResId" -Method Delete -Headers $authHeaders
Write-Host ("Reservations Delete: Status=" + $rresDelete.Status)

# CRUD ANNOUNCEMENTS
$rancCreate = Invoke-TestRequest -Uri "$baseUrl/announcements" -Method Post -Headers $authHeaders -Body @{ title = "TEST-Notice"; message = "TEST Message description" }
$testAncId = $rancCreate.Data._id
Write-Host ("Announcements Create: Status=" + $rancCreate.Status + " ID=" + $testAncId)

$rancUpdate = Invoke-TestRequest -Uri "$baseUrl/announcements/$testAncId" -Method Put -Headers $authHeaders -Body @{ active = $false }
Write-Host ("Announcements Update: Status=" + $rancUpdate.Status + " Active=" + $rancUpdate.Data.active)

$rancDelete = Invoke-TestRequest -Uri "$baseUrl/announcements/$testAncId" -Method Delete -Headers $authHeaders
Write-Host ("Announcements Delete: Status=" + $rancDelete.Status)

# CRUD REPORTS
$rrepCreate = Invoke-TestRequest -Uri "$baseUrl/stats/reports" -Method Post -Headers $authHeaders -Body @{ title = "TEST-Report-Auto" }
$testRepId = $rrepCreate.Data._id
Write-Host ("Reports Create: Status=" + $rrepCreate.Status + " ID=" + $testRepId)

$rrepList = Invoke-TestRequest -Uri "$baseUrl/stats/reports" -Method Get -Headers $authHeaders
Write-Host ("Reports List: Status=" + $rrepList.Status + " Count=" + $rrepList.Data.Length)

$rrepDelete = Invoke-TestRequest -Uri "$baseUrl/stats/reports/$testRepId" -Method Delete -Headers $authHeaders
Write-Host ("Reports Delete: Status=" + $rrepDelete.Status)

# CLEANUP CONFIRMATION
Write-Host "=== CONFIRMING CLEANUP ==="
$checkBooks = Invoke-TestRequest -Uri "$baseUrl/books?search=TEST" -Method Get -Headers $authHeaders
$checkSeats = Invoke-TestRequest -Uri "$baseUrl/seats" -Method Get -Headers $authHeaders
$zSeats = ($checkSeats.Data | Where-Object { $_.label -like "*ZTEST*" })

Write-Host ("Cleanup Books TEST count: " + $checkBooks.Data.Length)
Write-Host ("Cleanup Seats ZTEST count: " + $zSeats.Length)
Write-Host "=== API SMOKE TESTS COMPLETED ==="
