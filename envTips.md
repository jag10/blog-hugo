# Ruby:

You are correct that macOS won't let you change anything with the Ruby version that comes installed with your Mac. However, it's possible to install gems like bundler using a separate version of Ruby that doesn't interfere with the one provided by Apple.

Using sudo to install gems, or changing permissions of system files and directories is strongly discouraged, even if you know what you are doing. Can we please stop providing this bad advice?

The solution involves two main steps:

Install a separate version of Ruby that does not interfere with the one that came with your Mac.
Update your PATH such that the location of the new Ruby version is first in the PATH. The list of directories, and the order in which the computer looks them up to find executable programs is called the PATH. If you type echo $PATH in Terminal, you will see the list of directories, separated by a colon.
There are several ways to install Ruby on a Mac. The best way that I recommend, and that I wish was more prevalent in the various installation instructions out there, is to use an automated script that will set up a proper Ruby environment for you. This drastically reduces the chances of running into an error due to inadequate instructions that make the user do a bunch of stuff manually and leaving it up to them to figure out all the necessary steps.

The other route you can take is to spend extra time doing everything manually and hoping for the best. First, you will want to install Homebrew, which makes it easy to install other tools and macOS apps.

Then, the 4 most popular ways to install a separate version of Ruby are:

If you don't need more than one version of Ruby at the same time (besides the one that came with macOS)
Homebrew - once it's installed, install ruby with brew install ruby, then update your PATH by running echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.bash_profile, followed by source ~/.bash_profile
To check that you're now using the non-system version of Ruby, you can run the following commands:

which ruby
It should be something other than /usr/bin/ruby

ruby -v
It should be something other than 2.3.7. As of today, 2.6.1 is the latest Ruby version.

Once you have this new version of Ruby installed, you can now install bundler:

gem install bundler
