import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Highlight, themes } from 'prism-react-renderer';
import * as jose from 'jose';

interface DecodedPart {
  [key: string]: any;
}

interface SignatureStatus {
  verified: boolean;
  message: string;
}

function JWTDecoder() {
  const [token, setToken] = useState<string>('');
  const [jwks, setJwks] = useState<string>('');
  const [decodedHeader, setDecodedHeader] = useState<DecodedPart | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<DecodedPart | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [showAbout, setShowAbout] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to safely decode base64 strings that might contain URL-safe characters
  const base64URLDecode = (str: string): string => {
    // Convert base64url to base64 by replacing URL-safe characters
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if needed
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;

    try {
      // Decode and convert to UTF-8 string
      return decodeURIComponent(escape(atob(padded)));
    } catch (e) {
      throw new Error('Invalid base64 string');
    }
  };

  const parseAndVerifyJwks = async (jwksContent: string, token: string): Promise<SignatureStatus> => {
    try {
      // Parse the JWKS content
      const jwksData = JSON.parse(jwksContent);

      // Validate that it's a proper JWKS format
      if (!jwksData.keys || !Array.isArray(jwksData.keys)) {
        throw new Error('Invalid JWKS format - missing keys array');
      }

      // Create a local JWKS
      const JWKS = jose.createLocalJWKSet(jwksData);

      // Verify the token
      const { payload, protectedHeader } = await jose.jwtVerify(token, JWKS, {
        // Support a wide range of algorithms
        algorithms: ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      });

      return {
        verified: true,
        message: `Signature verified successfully (algorithm: ${protectedHeader.alg}, key ID: ${protectedHeader.kid || 'none'})`
      };
    } catch (err) {
      if (err instanceof Error) {
        console.error('Signature verification failed:', err);
        return {
          verified: false,
          message: `Signature verification failed: ${err.message}`
        };
      } else {
        console.error('Signature verification failed:', err);
        return {
          verified: false,
          message: `Signature verification failed: An unknown error occurred`
        };
      }
    }
  };

  const decodeToken = async () => {
    setError('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setSignatureStatus(null);
    setIsVerifying(false);

    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      // Split the token into its parts
      const [headerB64, payloadB64, signature] = token.split('.');

      if (!headerB64 || !payloadB64) {
        throw new Error('Invalid JWT format');
      }

      // Decode and parse the header and payload
      const header = JSON.parse(base64URLDecode(headerB64));
      const payload = JSON.parse(base64URLDecode(payloadB64));

      setDecodedHeader(header);
      setDecodedPayload(payload);

      // Check token expiration
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();
        if (expirationDate < now) {
          setError('Warning: This token has expired');
        }
      }

      // If JWKS content is provided, verify the signature
      if (jwks.trim()) {
        setIsVerifying(true);
        try {
          const verificationResult = await parseAndVerifyJwks(jwks, token);
          setSignatureStatus(verificationResult);
        } catch (err) {
          setError('Invalid JWKS format: ' + (err instanceof Error ? err.message : 'An unknown error occurred'));
        }
        setIsVerifying(false);
      }
    } catch (err) {
      setError((err instanceof Error ? err.message : 'Invalid JWT token') || 'Invalid JWT token');
    }
  };

  // Helper functions for formatting JSON and timestamps
  const formatJSON = (obj: DecodedPart): string => {
    return JSON.stringify(obj, null, 2);
  };

  const formatTimestamp = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch {
      return timestamp.toString();
    }
  };

  const formatPayloadDisplay = (payload: DecodedPart | null): string => {
    if (!payload) return '';
    const formatted = { ...payload };
    ['exp', 'iat', 'nbf'].forEach(claim => {
      if (formatted[claim]) {
        formatted[claim] = `${formatted[claim]} (${formatTimestamp(formatted[claim])})`;
      }
    });
    return formatJSON(formatted);
  };

  // Components for displaying JSON and token input
  const JsonDisplay: React.FC<{ content: string }> = ({ content }) => (
    <Highlight
      theme={themes.nightOwl}
      code={content}
      language="json"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} p-4 text-sm rounded-md overflow-auto border border-border`} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  const TokenInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
  }> = ({ value, onChange, placeholder }) => (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
        placeholder={placeholder}
        spellCheck="false"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JWT Decoder</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Paste your JWT token and optionally provide JWKS content for signature verification
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            JWT Token
          </label>
          <TokenInput
            value={token}
            onChange={setToken}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            JWKS Content (optional)
          </label>
          <TokenInput
            value={jwks}
            onChange={setJwks}
            placeholder={'{\n  "keys": [\n    {\n      "kty": "RSA",\n      "kid": "...",\n      ...\n    }\n  ]\n}'}
          />
          <p className="mt-1 text-sm text-gray-500">
            Paste the content of your JWKS endpoint to verify the token's signature
          </p>
        </div>

        <button
          onClick={decodeToken}
          disabled={isVerifying}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isVerifying ? 'Verifying...' : 'Decode Token'}
        </button>

        {error && (
          <div className="p-4 text-sm border rounded-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {signatureStatus && (
          <div className={`p-4 text-sm border rounded-md ${signatureStatus.verified
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}>
            {signatureStatus.message}
          </div>
        )}

        {decodedHeader && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Header</h2>
            <JsonDisplay content={formatJSON(decodedHeader)} />
          </div>
        )}

        {decodedPayload && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Payload</h2>
            <JsonDisplay content={formatPayloadDisplay(decodedPayload)} />
          </div>
        )}
      </div>

      {showAbout && (
        <div className="mt-8 p-4 border rounded-md border-border bg-gray-50 dark:bg-gray-800 relative">
          <button
            onClick={() => setShowAbout(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close about section"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold mb-2">About JWT Tokens</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            JSON Web Tokens (JWT) are an open standard (
            <a
              href="https://tools.ietf.org/html/rfc7519"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              RFC 7519
            </a>
            ) that define a compact and self-contained way for securely transmitting
            information between parties as a JSON object. JWTs consist of three parts:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="text-blue-500 dark:text-blue-400">• Header: Contains the token type and signing algorithm</li>
            <li className="text-purple-500 dark:text-purple-400">• Payload: Contains the claims (data)</li>
            <li className="text-green-500 dark:text-green-400">• Signature: Verifies the token hasn't been altered</li>
          </ul>
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-1">Signature Verification</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To verify a token's signature, you'll need the JWKS (JSON Web Key Set) content from your identity provider.
              You can typically find this at endpoints like:
            </p>
            <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• PingFederate: https://YOUR_DOMAIN/pf/JWKS</li>
              <li>• Auth0: https://YOUR_DOMAIN/.well-known/jwks.json</li>
              <li>• Okta: https://YOUR_DOMAIN/oauth2/default/v1/keys</li>
              <li>• Azure AD: https://login.microsoftonline.com/TENANT_ID/discovery/v2.0/keys</li>
            </ul>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Visit these URLs in your browser, copy the JSON content, and paste it into the JWKS Content field above
              to verify your token's signature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JWTDecoder;