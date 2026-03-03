-- Create deleted@documenso.com
DO $$
BEGIN  
  IF NOT EXISTS (SELECT 1 FROM "documenso"."User" WHERE "email" = 'deleted-account@documenso.com') THEN  
    INSERT INTO
      "documenso"."User" (
        "email",
        "emailVerified",
        "password",
        "createdAt",
        "updatedAt",
        "lastSignedIn",
        "roles",
        "identityProvider",
        "twoFactorEnabled"
      )
    VALUES
      (
        'deleted-account@documenso.com',
        NOW(),
        NULL,
        NOW(),
        NOW(),
        NOW(),
        ARRAY['USER'::TEXT]::"documenso"."Role" [],
        CAST('GOOGLE'::TEXT AS "documenso"."IdentityProvider"),
        FALSE
      );
  END IF;  
END $$
