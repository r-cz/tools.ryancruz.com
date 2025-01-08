import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Highlight, themes } from 'prism-react-renderer';

function JWTDecoder() {
  const [token, setToken] = useState('');
  const [decodedHeader, setDecodedHeader] = useState(null);
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [error, setError] = useState('');
  const [showAbout, setShowAbout] = useState(true);
  const textareaRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Helper function to safely decode base64 strings that might contain URL-safe characters
  const base64URLDecode = (str) => {
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

  const decodeToken = () => {
    setError('');
    setDecodedHeader(null);
    setDecodedPayload(null);

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
    } catch (err) {
      setError(err.message || 'Invalid JWT token');
    }
  };

  // Format a JSON object for display
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  // Helper to format Unix timestamps in the payload
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Function to format specific JWT claims
  const formatPayloadDisplay = (payload) => {
    const formatted = { ...payload };
    // Format standard time-based claims
    ['exp', 'iat', 'nbf'].forEach(claim => {
      if (formatted[claim]) {
        formatted[claim] = `${formatted[claim]} (${formatTimestamp(formatted[claim])})`;
      }
    });
    return formatJSON(formatted);
  };

  // Component for syntax-highlighted JSON
  const JsonDisplay = ({ content }) => (
    <Highlight
      theme={themes.nightOwl}
      code={content}
      language="json"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} p-4 text-sm rounded-md overflow-auto border border-border`} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  // Custom TokenInput component that shows the JWT parts in different colors
  const TokenInput = ({ value, onChange }) => {
    const handleChange = (e) => {
      onChange(e.target.value);
      setCursorPosition(e.target.selectionStart);
    };

    // Split the token into its three parts
    const parts = value.split('.');
    const spans = parts.map((part, index) => ({
      text: part,
      color: index === 0 ? 'text-blue-500 dark:text-blue-400' : 
             index === 1 ? 'text-purple-500 dark:text-purple-400' :
                          'text-green-500 dark:text-green-400'
    }));

    // Effect to maintain cursor position after re-render
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [cursorPosition]);

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="token"
          value={value}
          onChange={handleChange}
          className="w-full h-32 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 border-border font-mono opacity-0"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
        <div 
          className="w-full h-32 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-border font-mono overflow-auto whitespace-pre-wrap"
          aria-hidden="true"
        >
          {spans.map((span, index) => (
            <>
              <span key={index} className={span.color}>{span.text}</span>
              {index < spans.length - 1 && <span className="text-gray-400">.</span>}
            </>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">JWT Decoder</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Paste your JWT token below to decode its contents
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-1">
            JWT Token
          </label>
          <TokenInput value={token} onChange={setToken} />
        </div>

        <button
          onClick={decodeToken}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Decode Token
        </button>

        {error && (
          <div className="p-4 text-sm border rounded-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            {error}
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
        </div>
      )}
    </div>
  );
}

export default JWTDecoder;