<?php

namespace phpbb\auth\provider\oauth2;

use League\OAuth2\Client\Token\AccessTokenInterface;
use phpbb\db\driver\driver_interface;
use phpbb\user;

class token_storage
{
	protected string $cached_state;

	protected string $cached_pkce_code;

	protected AccessTokenInterface $cached_token;

	public function __construct(protected driver_interface $db, protected user $user,
								protected string $oauth_token_table, protected string $oauth_state_table)
	{
	}

	public function store_state(string $service_name, string $state): void
	{
		$this->cached_state = $state;

		$data = [
			'user_id'		=> $this->user->id(),
			'provider'		=> $service_name,
			'oauth_state'	=> $state,
			'session_id'	=> $this->user->data['session_id'],
		];

		$sql = 'INSERT INTO ' . $this->oauth_state_table . ' ' . $this->db->sql_build_array('INSERT', $data);
		$this->db->sql_query($sql);
	}

	/**
	 * A helper function that performs the query for retrieving a state.
	 *
	 * @param array		$data		The SQL WHERE data
	 * @return array|false			array with the OAuth state row,
	 *								false if the state does not exist
	 */
	protected function get_state_row(string $service_name): false|array
	{
		$data = [
			'user_id'	=> $this->user->id(),
			'provider'	=> $service_name,
		];

		if ($this->user->id() === ANONYMOUS)
		{
			$data['session_id']	= $this->user->data['session_id'];
		}

		$sql = 'SELECT oauth_state, pkce_code
			FROM ' . $this->oauth_state_table . '
			WHERE ' . $this->db->sql_build_array('SELECT', $data);
		$result = $this->db->sql_query($sql);
		$row = $this->db->sql_fetchrow($result);
		$this->db->sql_freeresult($result);

		if ($row)
		{
			$this->cached_state = $row['oauth_state'];
			$this->cached_pkce_code = $row['pkce_code'];
		}

		return $row;
	}

	public function get_state(string $service_name)
	{
		if ($this->cached_state)
		{
			return $this->cached_state;
		}

		return $this->get_state_row($service_name)['oauth_state'] ?? '';
	}

	public function get_pkce_code(string $service_name): string
	{
		if ($this->cached_pkce_code)
		{
			return $this->cached_pkce_code;
		}

		return $this->get_state_row($service_name)['pkce_code'] ?? '';
	}

	public function store_authentication_token(string $service_name, AccessTokenInterface $token): void
	{
		$this->cached_token = $token;

		$json_token = $this->json_encode_token($token);
		$data = [
			'oauth_token'	=> $json_token,
		];


		$sql = 'UPDATE ' . $this->oauth_token_table . '
			SET ' . $this->db->sql_build_array('UPDATE', $data) . '
			WHERE user_id = ' . $this->user->id() . "
				AND provider = '" . $this->db->sql_escape($service_name) . "'";

		if ($this->user->id() === ANONYMOUS)
		{
			$sql .= " AND session_id = '" . $this->db->sql_escape($this->user->data['session_id']) . "'";
		}

		$this->db->sql_query($sql);

		if (!$this->db->sql_affectedrows())
		{
			$data = [
				'user_id'		=> $this->user->id(),
				'provider'		=> $service_name,
				'oauth_token'	=> $json_token,
				'session_id'	=> $this->user->data['session_id'],
			];

			$sql = 'INSERT INTO ' . $this->oauth_token_table . $this->db->sql_build_array('INSERT', $data);

			$this->db->sql_query($sql);
		}
	}

	/**
	 * A helper function that JSON encodes a TokenInterface's data.
	 *
	 * @param AccessTokenInterface	$token
	 * @return string					The json encoded TokenInterface's data
	 */
	public function json_encode_token(AccessTokenInterface $token): string
	{
		$token_data = $token->jsonSerialize();
		$token_data += [
			'token_class'	=> get_class($token),
		];

		return json_encode($token_data);
	}
}
