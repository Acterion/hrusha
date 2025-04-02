## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/yourusername/hrusha.git
  cd hrusha
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Set up environment variables:
  ```bash
  cp .env.example .env
  ```
  Then edit `.env` with your configuration values.

## Usage

1. Start the development server:
  ```bash
  npm run dev
  ```

2. Build for production:
  ```bash
  npm run build
  ```

3. Run the production server:
  ```bash
  npm run preview
  ```

## CLI Tools

The project includes CLI utilities that can be run in two ways:

1. Run a specific script:
  ```bash
  npm run cli <script-name>
  ```

2. Launch interactive mode to choose a script:
  ```bash
  npm run cli:interactive
  ```