<?php

namespace phpbb\auth\provider\oauth2\wrapper;

use League\OAuth2\Client\Provider\AbstractProvider;

interface wrapper_interface
{
	public function get_icon(): string;

	public function get_name(): string;

	public function get_provider(array $options): AbstractProvider;

	public function has_credentials(): bool;
}
