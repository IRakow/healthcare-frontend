-- Add subdomain field to employers table
alter table employers
add column subdomain text unique;

-- Add index for subdomain lookups
create index idx_employers_subdomain on employers(subdomain);

-- Example data
-- update employers set subdomain = 'acme' where name = 'Acme Corporation';
-- update employers set subdomain = 'contoso' where name = 'Contoso Ltd';