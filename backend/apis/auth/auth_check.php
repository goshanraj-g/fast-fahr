<?php

/**
 * @return int
 * @throws \Exception
 */
function require_login(): int
{
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || !isset($_SESSION['user_id'])) {
        throw new \Exception('Authentication required.', 401);
    }
    return (int)$_SESSION['user_id'];
}