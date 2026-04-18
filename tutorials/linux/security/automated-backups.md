# Scheduled and Automated Backups

In this tutorial (ToC):

- [Create private GitHub Repository](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#create-private-github-repository)
- [Add SSH Keys to private GitHub Repository](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#add-ssh-keys-to-private-github-repository)
- [Enable LFS](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#enable-lfs)
- [Select resources to backup](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#select-resources-to-backup)
- [Create a bash script](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#create-the-bash-script)
- [Schedule backups with CRON](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/automated-backups.md#schedule-backups-with-cron)

## Create private GitHub Repository

- Go to [create new repository](https://github.com/new)
- Enter its name, `backups` for example
- Select "Private"
- Hit <kbd>Create Repository</kbd> button

## Add SSH Keys to private GitHub Repository

Read [official tutorial by GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).

- Check for existing ssh keys in `~/.ssh` if directory is empty, generate SSH key:
  - Read [official instructions by GitHub](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/#platform-linux)
  - `ssh-keygen -t rsa -b 4096 -C "john@example.com"` where `john@example.com` is email used to sign up on GitHub
- Create identity record in `~/.ssh/config`:

```bash
# ~/.ssh/config
Host           github.com
Hostname       github.com
User           git
IdentityFile   ~/.ssh/id_rsa
IdentitiesOnly yes
```

- Read SSH key: `cat ~/.ssh/id_rsa.pub`
- Go to [Keys management page on GitHub](https://github.com/settings/keys)
- Click on <kbd>New SSH key</kbd> button
- Enter the "title" describing host
- Copy paste contents of `~/.ssh/id_rsa.pub` into "Key" text area
- Click on <kbd>Add SSH key</kbd> button

## Enable LFS

- LFS is highly recommended if the final backup archive is larger than 50 MBs
- Read [official docs](https://help.github.com/articles/configuring-git-large-file-storage/)
- Track `7z` archives with: `git lfs track "*.7z"` for our case

## Select resources to backup

Think about what are you planning to backup, here are some paths and files for inspiration:

- `/var/www`
- `/var/log/syslog`
- `/var/log/auth.log`
- `/var/log/debug`
- `/var/log/messages`
- `/var/log/nginx/error.log`
- `/var/log/mongodb/mongod.log`
- Mongo DB with `mongodump`
- Databases in general

## Create the bash script

Before you go:

- Clone repository into `~/` (home directory) `git clone git://url-to-repository`
- It will create directory with repository name, `backups` in our case
- Install 7z, with: `apt-get install p7zip-full`

In this file:

- Keep backups only for last 7 days (*change to meet your needs*)
- Every backup has unique name with a date stamp
- Backup Mongo DB (*change to DB of your choice*)
- Backup `/var/www/` directory
- Backup most useful log files
- Archive every file into `.7z` with a password

```bash
#!/bin/bash
# Change Directory to repository
cd /root/backups/

DATE=$(date +%Y%m%d)
DATEOLD=`date -d "${DATE} -7 day" +%Y%m%d`

mongodump \
  --host rs0/1.example.com,2.example.com,3.example.com \
  --gzip \
  --archive="/root/backups/mongodb.$DATE.gz"

tar --exclude='node_modules' -zcf "/root/backups/www.$DATE.tar.gz" /var/www
tar -zcf "/root/backups/syslog.$DATE.tar.gz" /var/log/syslog
tar -zcf "/root/backups/auth.$DATE.tar.gz" /var/log/auth.log
faillog -a > /root/backups/faillog.log
tar -zcf "/root/backups/faillog.$DATE.tar.gz" /root/backups/faillog.log
lastlog > /root/backups/lastlog.log
tar -zcf "/root/backups/lastlog.$DATE.tar.gz" /root/backups/lastlog.log
tar -zcf "/root/backups/messages.$DATE.tar.gz" /var/log/messages
tar -zcf "/root/backups/mongod.$DATE.tar.gz" /var/log/mongodb/mongod.log
tar -zcf "/root/ostrio-b/nginx-access.$DATE.tar.gz" /var/log/nginx/access.log
tar -zcf "/root/ostrio-b/nginx-error.$DATE.tar.gz" /var/log/nginx/error.log

# CHANGE <PASSWORD> TO THE PASSWORD OF YOUR CHOICE
7z a "/root/backups/b.$DATE.7z" "/root/backups/mongodb.$DATE.gz" "/root/backups/www.$DATE.tar.gz" "/root/backups/syslog.$DATE.tar.gz" "/root/backups/auth.$DATE.tar.gz" "/root/backups/faillog.$DATE.tar.gz" "/root/backups/lastlog.$DATE.tar.gz" "/root/backups/messages.$DATE.tar.gz" "/root/backups/mongod.$DATE.tar.gz" "/root/backups/nginx-error.$DATE.tar.gz" "/root/backups/nginx-access.$DATE.tar.gz" -p<PASSWORD>

rm "/root/backups/mongodb.$DATE.gz"
rm "/root/backups/www.$DATE.tar.gz"
rm "/root/backups/syslog.$DATE.tar.gz"
rm "/root/backups/auth.$DATE.tar.gz"
rm "/root/backups/faillog.$DATE.tar.gz"
rm "/root/backups/faillog.log"
rm "/root/backups/lastlog.$DATE.tar.gz"
rm "/root/backups/lastlog.log"
rm "/root/backups/messages.$DATE.tar.gz"
rm "/root/backups/mongod.$DATE.tar.gz"
rm "/root/backups/nginx-error.$DATE.tar.gz"
rm "/root/backups/nginx-access.$DATE.tar.gz"

# Remove backup older than 7 days:
rm "/root/backups/b.$DATEOLD.7z"
# Remove old backup from repository history (save LFS storage space):
git rm --cached "b.$DATEOLD.7z"

# Optional for rare cases (save LFS storage space):
# git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch b.$DATEOLD.7z' --prune-empty --tag-name-filter cat -- --all

git pull
git add .
git commit -m "bckp $DATE"
git push origin master
```

Create file `backup.sh`, with contents of script above:

```shell
nano ~/backup.sh
```

Give execution permissions:

```shell
chmod +x ~/backup.sh
```

## Schedule backups with CRON

Open CRON editor:

```shell
crontab -e
```

Enter next rule:

```crontab
# Daily at 00:00, saving logs to /var/log/backup.log
0 0 * * * /root/backup.sh > /var/log/backup.log 2>&1
```
