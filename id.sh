#!/bin/bash

KEY=~/.ssh/azoome
EMAIL="github@malix.com"

ALLOWED_SIGNERS=~/.ssh/allowed_signers

echo "github@malix.com $(cat ~/.ssh/azoome.pub)"       >> "$ALLOWED_SIGNERS"
echo "malix@swoop.com $(cat ~/.ssh/malix_swoop.pub)"   >> "$ALLOWED_SIGNERS"
sort -u "$ALLOWED_SIGNERS" -o "$ALLOWED_SIGNERS"

# Add key to macOS keychain (only prompts once)
ssh-add --apple-use-keychain "$KEY"

# Set SSH command for this session (forces this key for git push/pull)
export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes"

# Set email locally for this repo only
git config --local user.email "$EMAIL"
git config --local gpg.format "ssh"
git config --local user.signingkey "$KEY.pub"
git config --local commit.gpgsign true


echo "✓ SSH key added to keychain"
echo "✓ GIT_SSH_COMMAND set for this session"
echo "✓ git user.email set to $EMAIL (local)"
echo ""
echo "Active signing key: $(git config --local user.signingkey || git config --global user.signingkey || echo 'none set')"
echo "SSH agent keys:"
ssh-add -l
