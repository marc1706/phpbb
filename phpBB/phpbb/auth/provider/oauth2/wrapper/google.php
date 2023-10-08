<?php

namespace phpbb\auth\provider\oauth2\wrapper;

use League\OAuth2\Client\Provider\AbstractProvider;

class google implements wrapper_interface
{
	public function __construct(private \phpbb\config\config $config)
	{}

	public function get_icon(): string
	{
		return 'flat-color-icons:google';
	}

	public function get_name(): string
	{
		return 'AUTH_PROVIDER_OAUTH_SERVICE_GOOGLE';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_provider(array $options): AbstractProvider
	{
		// Get config options for this wrapper
		$options += [
			'clientId'		=> $this->config['auth_oauth_google_key'],
			'clientSecret'	=> $this->config['auth_oauth_google_secret'],
			'pkceMethod'	=> AbstractProvider::PKCE_METHOD_S256,
		];

		return new \League\OAuth2\Client\Provider\Google($options);
	}

	public function has_credentials(): bool
	{
		return $this->config['auth_oauth_google_key'] && $this->config['auth_oauth_google_secret'];
	}
}
